from datetime import date

from pydantic import BaseModel

from app.schemas.subscription import SubscriptionOut


class SummaryOut(BaseModel):
    monthly_total: float
    yearly_total: float
    active_subscriptions: int
    inactive_subscriptions: int
    total_subscriptions: int
    nearest_payment: SubscriptionOut | None
    most_expensive_subscription: SubscriptionOut | None
    budget_limit: float | None
    budget_used_percent: float | None
    budget_status: str


class CategorySpending(BaseModel):
    category: str
    monthly_total: float
    yearly_total: float


class MonthlySpending(BaseModel):
    month: str
    amount: float


class UpcomingPayment(BaseModel):
    id: int
    name: str
    price: float
    currency: str
    category: str
    next_payment_date: date
    days_until: int
