from dataclasses import dataclass
from uuid import uuid4


@dataclass
class UserRecord:
    id: str
    full_name: str
    email: str
    hashed_password: str


class AuthRepository:
    def __init__(self) -> None:
        self._users: dict[str, UserRecord] = {}

    def create_user(self, full_name: str, email: str, hashed_password: str) -> UserRecord:
        user = UserRecord(
            id=str(uuid4()),
            full_name=full_name,
            email=email.lower(),
            hashed_password=hashed_password,
        )
        self._users[user.email] = user
        return user

    def get_user_by_email(self, email: str) -> UserRecord | None:
        return self._users.get(email.lower())


auth_repository = AuthRepository()
