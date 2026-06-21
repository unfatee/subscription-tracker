import csv
import io

from app.models.subscription import Subscription


def subscriptions_csv(items: list[Subscription]) -> str:
    output = io.StringIO(newline="")
    writer = csv.writer(output)
    writer.writerow(["name", "description", "price", "currency", "billing_period", "category", "start_date", "next_payment_date", "is_active"])
    for item in items:
        writer.writerow([
            item.name,
            item.description or "",
            item.price,
            item.currency,
            item.billing_period.value,
            item.category,
            item.start_date.isoformat(),
            item.next_payment_date.isoformat(),
            item.is_active,
        ])
    return output.getvalue()
