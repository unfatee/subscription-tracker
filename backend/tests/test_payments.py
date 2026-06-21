def test_payment_history_created_and_deleted(client, auth_headers, subscription_payload):
    item = client.post("/subscriptions", json=subscription_payload, headers=auth_headers).json()
    client.patch(f"/subscriptions/{item['id']}/mark-paid", headers=auth_headers)
    history = client.get(f"/payments?subscription_id={item['id']}", headers=auth_headers)
    assert history.status_code == 200
    assert len(history.json()) == 1
    payment_id = history.json()[0]["id"]
    assert client.delete(f"/payments/{payment_id}", headers=auth_headers).status_code == 204
    assert client.get("/payments", headers=auth_headers).json() == []
