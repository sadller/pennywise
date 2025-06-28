from pydantic import BaseModel, EmailStr
from typing import Optional


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    username: Optional[str] = None
    password: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class GoogleAuthRequest(BaseModel):
    code: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    email: str
    full_name: Optional[str] = None


class UserResponse(UserBase):
    id: int
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    auth_provider: str
    is_active: bool
    is_superuser: bool

    class Config:
        from_attributes = True


class TokenData(BaseModel):
    user_id: Optional[int] = None 