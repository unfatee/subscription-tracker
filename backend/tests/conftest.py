import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app

engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSession = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def override_get_db():
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def clean_database():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    yield


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def auth_headers(client):
    client.post("/auth/register", json={"email": "test@example.com", "password": "password123", "name": "Test User"})
    response = client.post("/auth/login", json={"email": "test@example.com", "password": "password123"})
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


@pytest.fixture
def subscription_payload():
    return {
        "name": "Netflix",
        "description": "Streaming",
        "price": 15.99,
        "currency": "USD",
        "billing_period": "monthly",
        "category": "Entertainment",
        "start_date": "2026-01-01",
        "next_payment_date": "2026-01-31",
        "is_active": True,
    }
