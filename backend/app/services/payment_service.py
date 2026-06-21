from datetime import date

from sqlalchemy.orm import Session

from app.models.payment_history import PaymentHistory
from app.models.subscription import Subscription
from app.utils.dates import next_billing_date


def mark_subscription_paid(db: Session, subscription: Subscription) -> Subscription:
    payment = PaymentHistory(
        user_id=subscription.user_id,
        subscription_id=subscription.id,
        amount=subscription.price,
        currency=subscription.currency,
        payment_date=date.today(),
    )
    subscription.next_payment_date = next_billing_date(subscription.next_payment_date, subscription.billing_period)
    db.add(payment)
    db.commit()
    db.refresh(subscription)
    return subscription
