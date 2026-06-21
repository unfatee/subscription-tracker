from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.subscription import BillingPeriod, Subscription
from app.models.user import User
from app.schemas.subscription import SubscriptionCreate, SubscriptionOut, SubscriptionUpdate
from app.services.csv_service import subscriptions_csv
from app.services.payment_service import mark_subscription_paid
from app.services.subscription_service import create_demo_data, create_subscription, owned_subscription, update_subscription

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])


@router.get("", response_model=list[SubscriptionOut])
def list_subscriptions(
    category: str | None = None,
    is_active: bool | None = None,
    search: str | None = None,
    billing_period: BillingPeriod | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = select(Subscription).where(Subscription.user_id == user.id)
    if category:
        query = query.where(Subscription.category == category)
    if is_active is not None:
        query = query.where(Subscription.is_active == is_active)
    if search:
        query = query.where(Subscription.name.ilike(f"%{search}%"))
    if billing_period:
        query = query.where(Subscription.billing_period == billing_period)
    return list(db.scalars(query.order_by(Subscription.next_payment_date, Subscription.name)).all())


@router.get("/export/csv")
def export_csv(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    items = list(db.scalars(select(Subscription).where(Subscription.user_id == user.id).order_by(Subscription.name)).all())
    content = subscriptions_csv(items)
    return StreamingResponse(
        iter([content]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": 'attachment; filename="subscriptions.csv"'},
    )


@router.post("/demo-data", response_model=list[SubscriptionOut], status_code=status.HTTP_201_CREATED)
def demo_data(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return create_demo_data(db, user.id)


@router.post("", response_model=SubscriptionOut, status_code=status.HTTP_201_CREATED)
def create(data: SubscriptionCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return create_subscription(db, user.id, data)


def require_subscription(db: Session, subscription_id: int, user_id: int) -> Subscription:
    item = owned_subscription(db, subscription_id, user_id)
    if not item:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return item


@router.get("/{subscription_id}", response_model=SubscriptionOut)
def get_one(subscription_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return require_subscription(db, subscription_id, user.id)


@router.put("/{subscription_id}", response_model=SubscriptionOut)
def update(subscription_id: int, data: SubscriptionUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    item = require_subscription(db, subscription_id, user.id)
    try:
        return update_subscription(db, item, data)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))


@router.delete("/{subscription_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(subscription_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    item = require_subscription(db, subscription_id, user.id)
    db.delete(item)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch("/{subscription_id}/toggle-active", response_model=SubscriptionOut)
def toggle_active(subscription_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    item = require_subscription(db, subscription_id, user.id)
    item.is_active = not item.is_active
    db.commit()
    db.refresh(item)
    return item


@router.patch("/{subscription_id}/mark-paid", response_model=SubscriptionOut)
def mark_paid(subscription_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    item = require_subscription(db, subscription_id, user.id)
    return mark_subscription_paid(db, item)
