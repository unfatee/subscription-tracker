from collections import defaultdict
from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.budget import Budget
from app.models.subscription import BillingPeriod, Subscription
from app.utils.dates import add_months, month_start, next_billing_date


def costs(subscription: Subscription) -> tuple[Decimal, Decimal]:
    price = Decimal(subscription.price)
    if subscription.billing_period == BillingPeriod.monthly:
        return price, price * 12
    if subscription.billing_period == BillingPeriod.yearly:
        return price / 12, price
    if subscription.billing_period == BillingPeriod.weekly:
        return price * Decimal("4.33"), price * 52
    return price / 3, price * 4


def active_for_user(db: Session, user_id: int) -> list[Subscription]:
    return list(db.scalars(select(Subscription).where(Subscription.user_id == user_id, Subscription.is_active.is_(True))).all())


def summary(db: Session, user_id: int) -> dict:
    all_items = list(db.scalars(select(Subscription).where(Subscription.user_id == user_id)).all())
    active = [item for item in all_items if item.is_active]
    monthly_total = sum((costs(item)[0] for item in active), Decimal(0))
    yearly_total = sum((costs(item)[1] for item in active), Decimal(0))
    nearest = min(active, key=lambda item: item.next_payment_date, default=None)
    expensive = max(active, key=lambda item: costs(item)[0], default=None)
    budget = db.scalar(select(Budget).where(Budget.user_id == user_id))
    percent = float(monthly_total / budget.monthly_limit * 100) if budget and budget.monthly_limit else None
    status = "not_set" if percent is None else "over" if percent > 100 else "warning" if percent >= 80 else "on_track"
    return {
        "monthly_total": round(float(monthly_total), 2),
        "yearly_total": round(float(yearly_total), 2),
        "active_subscriptions": len(active),
        "inactive_subscriptions": len(all_items) - len(active),
        "total_subscriptions": len(all_items),
        "nearest_payment": nearest,
        "most_expensive_subscription": expensive,
        "budget_limit": float(budget.monthly_limit) if budget else None,
        "budget_used_percent": round(percent, 2) if percent is not None else None,
        "budget_status": status,
    }


def by_category(db: Session, user_id: int) -> list[dict]:
    totals = defaultdict(lambda: [Decimal(0), Decimal(0)])
    for item in active_for_user(db, user_id):
        monthly, yearly = costs(item)
        totals[item.category][0] += monthly
        totals[item.category][1] += yearly
    return [
        {"category": category, "monthly_total": round(float(values[0]), 2), "yearly_total": round(float(values[1]), 2)}
        for category, values in sorted(totals.items())
    ]


def monthly_spending(db: Session, user_id: int) -> list[dict]:
    start = month_start(date.today())
    boundaries = [add_months(start, offset) for offset in range(13)]
    totals = [Decimal(0) for _ in range(12)]
    for item in active_for_user(db, user_id):
        due = item.next_payment_date
        guard = 0
        while due < start and guard < 1000:
            due = next_billing_date(due, item.billing_period)
            guard += 1
        while due < boundaries[-1] and guard < 2000:
            for index in range(12):
                if boundaries[index] <= due < boundaries[index + 1]:
                    totals[index] += Decimal(item.price)
                    break
            due = next_billing_date(due, item.billing_period)
            guard += 1
    return [{"month": boundaries[index].strftime("%b %Y"), "amount": round(float(total), 2)} for index, total in enumerate(totals)]


def upcoming(db: Session, user_id: int, days: int) -> list[dict]:
    today = date.today()
    deadline = today + timedelta(days=days)
    items = db.scalars(
        select(Subscription).where(
            Subscription.user_id == user_id,
            Subscription.is_active.is_(True),
            Subscription.next_payment_date >= today,
            Subscription.next_payment_date <= deadline,
        ).order_by(Subscription.next_payment_date)
    ).all()
    return [
        {
            "id": item.id,
            "name": item.name,
            "price": float(item.price),
            "currency": item.currency,
            "category": item.category,
            "next_payment_date": item.next_payment_date,
            "days_until": (item.next_payment_date - today).days,
        }
        for item in items
    ]
