from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies import get_current_user
from app.models.payment_history import PaymentHistory
from app.models.user import User
from app.schemas.payment_history import PaymentOut

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.get("", response_model=list[PaymentOut])
def list_payments(
    subscription_id: int | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = select(PaymentHistory).options(joinedload(PaymentHistory.subscription)).where(PaymentHistory.user_id == user.id)
    if subscription_id is not None:
        query = query.where(PaymentHistory.subscription_id == subscription_id)
    if date_from:
        query = query.where(PaymentHistory.payment_date >= date_from)
    if date_to:
        query = query.where(PaymentHistory.payment_date <= date_to)
    items = db.scalars(query.order_by(PaymentHistory.payment_date.desc(), PaymentHistory.id.desc())).all()
    return [
        PaymentOut(
            id=item.id,
            user_id=item.user_id,
            subscription_id=item.subscription_id,
            subscription_name=item.subscription.name if item.subscription else "Deleted subscription",
            amount=item.amount,
            currency=item.currency,
            payment_date=item.payment_date,
            created_at=item.created_at,
        )
        for item in items
    ]


@router.delete("/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payment(payment_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    payment = db.scalar(select(PaymentHistory).where(PaymentHistory.id == payment_id, PaymentHistory.user_id == user.id))
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    db.delete(payment)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
