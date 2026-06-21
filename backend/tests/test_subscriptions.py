def test_subscription_crud_and_filters(client, auth_headers, subscription_payload):
    created = client.post("/subscriptions", json=subscription_payload, headers=auth_headers)
    assert created.status_code == 201
    subscription_id = created.json()["id"]
    assert client.get("/subscriptions", headers=auth_headers).json()[0]["name"] == "Netflix"
    assert len(client.get("/subscriptions?category=Entertainment&is_active=true", headers=auth_headers).json()) == 1
    assert client.get(f"/subscriptions/{subscription_id}", headers=auth_headers).status_code == 200
    updated = client.put(f"/subscriptions/{subscription_id}", json={"price": 17.99, "name": "Netflix Premium"}, headers=auth_headers)
    assert updated.json()["price"] == "17.99"
    toggled = client.patch(f"/subscriptions/{subscription_id}/toggle-active", headers=auth_headers)
    assert toggled.json()["is_active"] is False
    assert client.delete(f"/subscriptions/{subscription_id}", headers=auth_headers).status_code == 204
    assert client.get(f"/subscriptions/{subscription_id}", headers=auth_headers).status_code == 404


def test_mark_paid_handles_end_of_month(client, auth_headers, subscription_payload):
    item = client.post("/subscriptions", json=subscription_payload, headers=auth_headers).json()
    paid = client.patch(f"/subscriptions/{item['id']}/mark-paid", headers=auth_headers)
    assert paid.status_code == 200
    assert paid.json()["next_payment_date"] == "2026-02-28"
    payments = client.get("/payments", headers=auth_headers).json()
    assert len(payments) == 1
    assert payments[0]["subscription_name"] == "Netflix"


def test_csv_export(client, auth_headers, subscription_payload):
    client.post("/subscriptions", json=subscription_payload, headers=auth_headers)
    response = client.get("/subscriptions/export/csv", headers=auth_headers)
    assert response.status_code == 200
    assert "Netflix" in response.text
    assert response.headers["content-type"].startswith("text/csv")


def test_users_cannot_access_each_others_subscription(client, auth_headers, subscription_payload):
    item = client.post("/subscriptions", json=subscription_payload, headers=auth_headers).json()
    client.post("/auth/register", json={"email": "other@example.com", "password": "password123", "name": "Other"})
    login = client.post("/auth/login", json={"email": "other@example.com", "password": "password123"}).json()
    other_headers = {"Authorization": f"Bearer {login['access_token']}"}
    assert client.get(f"/subscriptions/{item['id']}", headers=other_headers).status_code == 404
