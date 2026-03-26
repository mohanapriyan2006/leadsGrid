from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.schemas.auth import AuthToken, UserLogin, UserPublic, UserSignup
from app.services.auth_service import auth_service


router = APIRouter()


@router.post("/signup", response_model=AuthToken)
def signup(payload: UserSignup) -> AuthToken:
    return auth_service.signup(payload)


@router.post("/login", response_model=AuthToken)
def login(payload: UserLogin) -> AuthToken:
    return auth_service.login(payload)


@router.get("/me", response_model=UserPublic)
def me(current_user: UserPublic = Depends(get_current_user)) -> UserPublic:
    return current_user
