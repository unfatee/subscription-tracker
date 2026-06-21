from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.models.subscription import BillingPeriod


class SubscriptionBase(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    description: str | None = Field(default=None, max_length=1000)
    price: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    billing_period: BillingPeriod
    category: str = Field(min_length=1, max_length=80)
    start_date: date
    next_payment_date: date
    is_active: bool = True

    @field_validator("currency")
    @classmethod
    def normalize_currency(cls, value: str):
        return value.upper()

    @model_validator(mode="after")
    def payment_not_before_start(self):
        if self.next_payment_date < self.start_date:
            raise ValueError("Next payment date cannot be before start date")
        return self


class SubscriptionCreate(SubscriptionBase):
    pass


class SubscriptionUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=160)
    description: str | None = Field(default=None, max_length=1000)
    price: Decimal | None = Field(default=None, gt=0, max_digits=12, decimal_places=2)
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    billing_period: BillingPeriod | None = None
    category: str | None = Field(default=None, min_length=1, max_length=80)
    start_date: date | None = None
    next_payment_date: date | None = None
    is_active: bool | None = None

    @field_validator("currency")
    @classmethod
    def normalize_currency(cls, value: str | None):
        return value.upper() if value else value


class SubscriptionOut(SubscriptionBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
