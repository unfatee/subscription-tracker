from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class PaymentOut(BaseModel):
    id: int
    user_id: int
    subscription_id: int
    subscription_name: str | None = None
    amount: Decimal
    currency: str
    payment_date: date
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
