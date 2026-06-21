from datetime import date, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.subscription import BillingPeriod, Subscription
from app.schemas.subscription import SubscriptionCreate, SubscriptionUpdate


DEMO_SUBSCRIPTIONS = [
    ("Netflix", 15.99, "monthly", "Entertainment"),
    ("Spotify", 9.99, "monthly", "Music"),
    ("ChatGPT Plus", 20, "monthly", "Productivity"),
    ("GitHub Copilot", 10, "monthly", "Development"),
    ("Adobe Creative Cloud", 59.99, "monthly", "Software"),
    ("YouTube Premium", 13.99, "monthly", "Entertainment"),
    ("Notion", 8, "monthly", "Productivity"),
    ("Figma Professional", 12, "monthly", "Design"),
    ("iCloud+", 2.99, "monthly", "Cloud Storage"),
    ("NordVPN", 59.88, "yearly", "Security"),
]


def owned_subscription(db: Session, subscription_id: int, user_id: int) -> Subscription | None:
    return db.scalar(select(Subscription).where(Subscription.id == subscription_id, Subscription.user_id == user_id))


def create_subscription(db: Session, user_id: int, data: SubscriptionCreate) -> Subscription:
    subscription = Subscription(user_id=user_id, **data.model_dump())
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return subscription


def update_subscription(db: Session, subscription: Subscription, data: SubscriptionUpdate) -> Subscription:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(subscription, field, value)
    if subscription.next_payment_date < subscription.start_date:
        raise ValueError("Next payment date cannot be before start date")
    db.commit()
    db.refresh(subscription)
    return subscription


def create_demo_data(db: Session, user_id: int) -> list[Subscription]:
    existing = set(db.scalars(select(Subscription.name).where(Subscription.user_id == user_id)).all())
    today = date.today()
    created = []
    for index, (name, price, period, category) in enumerate(DEMO_SUBSCRIPTIONS, start=1):
        if name in existing:
            continue
        item = Subscription(
            user_id=user_id,
            name=name,
            description=f"Demo {category.lower()} subscription",
            price=price,
            currency="USD",
            billing_period=BillingPeriod(period),
            category=category,
            start_date=today - timedelta(days=90),
            next_payment_date=today + timedelta(days=index * 2),
            is_active=True,
        )
        db.add(item)
        created.append(item)
    db.commit()
    for item in created:
        db.refresh(item)
    return created
