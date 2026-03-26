from fastapi import HTTPException, status

from app.core.security import create_access_token, get_password_hash, verify_password
from app.repositories.auth_repository import UserRecord, auth_repository
from app.schemas.auth import AuthToken, UserLogin, UserPublic, UserSignup


class AuthService:
    def signup(self, payload: UserSignup) -> AuthToken:
        existing = auth_repository.get_user_by_email(payload.email)
        if existing is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists")

        user = auth_repository.create_user(
            full_name=payload.full_name,
            email=payload.email,
            hashed_password=get_password_hash(payload.password),
        )
        return self._build_token(user)

    def login(self, payload: UserLogin) -> AuthToken:
        user = auth_repository.get_user_by_email(payload.email)
        if user is None or not verify_password(payload.password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        return self._build_token(user)

    def get_user_by_email(self, email: str) -> UserPublic | None:
        user = auth_repository.get_user_by_email(email)
        if user is None:
            return None
        return UserPublic(id=user.id, full_name=user.full_name, email=user.email)

    def _build_token(self, user: UserRecord) -> AuthToken:
        user_public = UserPublic(id=user.id, full_name=user.full_name, email=user.email)
        access_token = create_access_token(subject=user.email)
        return AuthToken(access_token=access_token, user=user_public)


auth_service = AuthService()
