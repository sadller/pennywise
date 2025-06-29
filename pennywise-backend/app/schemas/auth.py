from pydantic import BaseModel, EmailStr
from typing import Optional


class UserBase(BaseModel):
    email: EmailStr
    username: Optional[str] = None
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: int
    auth_provider: str
    is_active: bool
    is_superuser: bool
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user_id: int
    email: str
    full_name: Optional[str] = None


class TokenRefresh(BaseModel):
    refresh_token: str


class GoogleAuthRequest(BaseModel):
    code: str


class TokenData(BaseModel):
    user_id: Optional[int] = None 