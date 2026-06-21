from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import analytics, auth, budget, payments, subscriptions

app = FastAPI(
    title=settings.app_name,
    description="API for recurring subscription management and spending analytics.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(subscriptions.router)
app.include_router(analytics.router)
app.include_router(budget.router)
app.include_router(payments.router)


@app.get("/health", tags=["System"])
def health():
    return {"status": "ok"}
