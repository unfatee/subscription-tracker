from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserOut, UserUpdate
from app.services.auth_service import authenticate, create_user, get_user_by_email
from app.utils.security import create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    if get_user_by_email(db, data.email):
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    try:
        return create_user(db, data)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="An account with this email already exists")


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate(db, data.email, data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    return {"access_token": create_access_token(str(user.id)), "token_type": "bearer", "user": user}


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@router.patch("/me", response_model=UserOut)
def update_me(data: UserUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    values = data.model_dump(exclude_unset=True)
    if "name" in values and values["name"]:
        user.name = values["name"].strip()
    if "default_currency" in values and values["default_currency"]:
        currency = values["default_currency"].upper()
        if len(currency) != 3:
            raise HTTPException(status_code=422, detail="Currency must be a 3-letter code")
        user.default_currency = currency
    db.commit()
    db.refresh(user)
    return user
