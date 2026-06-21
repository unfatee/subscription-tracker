from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.analytics import CategorySpending, MonthlySpending, SummaryOut, UpcomingPayment
from app.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary", response_model=SummaryOut)
def summary(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return analytics_service.summary(db, user.id)


@router.get("/by-category", response_model=list[CategorySpending])
def by_category(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return analytics_service.by_category(db, user.id)


@router.get("/monthly-spending", response_model=list[MonthlySpending])
def monthly_spending(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return analytics_service.monthly_spending(db, user.id)


@router.get("/upcoming-payments", response_model=list[UpcomingPayment])
def upcoming_payments(days: int = Query(30, ge=1, le=365), db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return analytics_service.upcoming(db, user.id, days)
