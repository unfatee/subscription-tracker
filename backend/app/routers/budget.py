from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.budget import Budget
from app.models.user import User
from app.schemas.budget import BudgetInput, BudgetOut

router = APIRouter(prefix="/budget", tags=["Budget"])


def find_budget(db: Session, user_id: int) -> Budget | None:
    return db.scalar(select(Budget).where(Budget.user_id == user_id))


@router.get("", response_model=BudgetOut | None)
def get_budget(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return find_budget(db, user.id)


@router.post("", response_model=BudgetOut)
def upsert_budget(data: BudgetInput, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    budget = find_budget(db, user.id)
    if budget:
        budget.monthly_limit = data.monthly_limit
        budget.currency = data.currency
    else:
        budget = Budget(user_id=user.id, **data.model_dump())
        db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


@router.put("", response_model=BudgetOut)
def update_budget(data: BudgetInput, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    budget = find_budget(db, user.id)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    budget.monthly_limit = data.monthly_limit
    budget.currency = data.currency
    db.commit()
    db.refresh(budget)
    return budget


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    budget = find_budget(db, user.id)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    db.delete(budget)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
