from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings
from app.core.security import decode_access_token
from app.services.auth_service import auth_service


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def get_current_user_email(token: str | None = Depends(oauth2_scheme)) -> str:
    if token is None and settings.allow_anonymous_dev:
        return "demo@pitchpilot.local"

    try:
        if token is None:
            raise ValueError("Missing token")
        payload = decode_access_token(token)
        email = payload.get("sub")
        if not email:
            raise ValueError("Missing subject")
        return email
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


def get_current_user(email: str = Depends(get_current_user_email)):
    if email == "demo@pitchpilot.local":
        return {"id": "demo-user", "full_name": "Demo User", "email": email}

    user = auth_service.get_user_by_email(email)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user
