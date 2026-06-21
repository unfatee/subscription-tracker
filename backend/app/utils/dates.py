import calendar
from datetime import date, timedelta

from app.models.subscription import BillingPeriod


def add_months(value: date, months: int) -> date:
    month_index = value.month - 1 + months
    year = value.year + month_index // 12
    month = month_index % 12 + 1
    day = min(value.day, calendar.monthrange(year, month)[1])
    return value.replace(year=year, month=month, day=day)


def next_billing_date(value: date, billing_period: BillingPeriod) -> date:
    if billing_period == BillingPeriod.weekly:
        return value + timedelta(days=7)
    if billing_period == BillingPeriod.monthly:
        return add_months(value, 1)
    if billing_period == BillingPeriod.quarterly:
        return add_months(value, 3)
    return add_months(value, 12)


def month_start(value: date) -> date:
    return value.replace(day=1)
