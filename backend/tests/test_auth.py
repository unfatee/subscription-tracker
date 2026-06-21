def test_register_user(client):
    response = client.post("/auth/register", json={"email": "new@example.com", "password": "strongpass", "name": "New User"})
    assert response.status_code == 201
    assert response.json()["email"] == "new@example.com"
    assert "hashed_password" not in response.json()


def test_duplicate_email_rejected(client):
    payload = {"email": "same@example.com", "password": "strongpass", "name": "First"}
    assert client.post("/auth/register", json=payload).status_code == 201
    assert client.post("/auth/register", json=payload).status_code == 409


def test_login_and_me(client):
    client.post("/auth/register", json={"email": "login@example.com", "password": "password123", "name": "Login User"})
    login = client.post("/auth/login", json={"email": "login@example.com", "password": "password123"})
    assert login.status_code == 200
    body = login.json()
    assert body["token_type"] == "bearer"
    me = client.get("/auth/me", headers={"Authorization": f"Bearer {body['access_token']}"})
    assert me.status_code == 200
    assert me.json()["name"] == "Login User"


def test_protected_route_requires_token(client):
    assert client.get("/subscriptions").status_code == 401
