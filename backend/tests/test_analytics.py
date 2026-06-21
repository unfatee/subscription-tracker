from datetime import date, timedelta


def create_item(client, headers, payload, **changes):
    data = {**payload, **changes}
    return client.post("/subscriptions", json=data, headers=headers).json()


def test_summary_and_category_totals(client, auth_headers, subscription_payload):
    create_item(client, auth_headers, subscription_payload)
    create_item(client, auth_headers, subscription_payload, name="Annual", price=120, billing_period="yearly", category="Software")
    summary = client.get("/analytics/summary", headers=auth_headers).json()
    assert summary["monthly_total"] == 25.99
    assert summary["yearly_total"] == 311.88
    assert summary["active_subscriptions"] == 2
    categories = client.get("/analytics/by-category", headers=auth_headers).json()
    assert {item["category"] for item in categories} == {"Entertainment", "Software"}


def test_upcoming_payments(client, auth_headers, subscription_payload):
    due = date.today() + timedelta(days=5)
    start = date.today() - timedelta(days=5)
    create_item(client, auth_headers, subscription_payload, start_date=start.isoformat(), next_payment_date=due.isoformat())
    upcoming = client.get("/analytics/upcoming-payments?days=10", headers=auth_headers).json()
    assert len(upcoming) == 1
    assert upcoming[0]["days_until"] == 5


def test_budget_status(client, auth_headers, subscription_payload):
    create_item(client, auth_headers, subscription_payload, price=90)
    assert client.post("/budget", json={"monthly_limit": 100, "currency": "USD"}, headers=auth_headers).status_code == 200
    summary = client.get("/analytics/summary", headers=auth_headers).json()
    assert summary["budget_used_percent"] == 90
    assert summary["budget_status"] == "warning"
