from pydantic import BaseModel, EmailStr, Field


class UserSignup(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserPublic(BaseModel):
    id: str
    full_name: str
    email: EmailStr


class AuthToken(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic
