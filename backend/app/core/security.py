from dataclasses import dataclass

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer


bearer_scheme = HTTPBearer(auto_error=False)


@dataclass
class UserContext:
    user_id: str
    email: str | None = None
    token: str | None = None


async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> UserContext:
    settings = request.app.state.settings
    firebase_client = request.app.state.firebase_client

    if not settings.require_auth:
        # Auth is optional in local development to keep iteration fast.
        fallback_user_id = request.headers.get("x-user-id", "local-dev-user")
        fallback_email = request.headers.get("x-user-email")
        token = credentials.credentials if credentials else None
        return UserContext(user_id=fallback_user_id, email=fallback_email, token=token)

    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
        )

    user_id = firebase_client.verify_token(credentials.credentials)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    return UserContext(
        user_id=user_id,
        email=request.headers.get("x-user-email"),
        token=credentials.credentials,
    )
