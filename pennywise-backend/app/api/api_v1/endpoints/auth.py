from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.services.auth_service import AuthService
from app.schemas.auth import UserCreate, UserLogin, Token, UserResponse, GoogleAuthRequest, TokenRefresh
from app.utils.auth import verify_token, verify_refresh_token
from app.utils.cookies import CookieManager
from typing import Optional

router = APIRouter()
security = HTTPBearer()


def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[UserResponse]:
    """Get current authenticated user."""
    token = None
    
    # First try to get token from Authorization header
    if credentials:
        token = credentials.credentials
    else:
        # Fallback to cookie
        token = request.cookies.get(CookieManager.AUTH_TOKEN_COOKIE)
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        user_id_int = int(user_id)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID in token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    auth_service = AuthService(db)
    user = auth_service.get_user_by_id(user_id_int)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return UserResponse.from_orm(user)


@router.post("/register", response_model=Token)
def register(user_data: UserCreate, response: Response, db: Session = Depends(get_db)):
    """Register a new user with email and password."""
    auth_service = AuthService(db)
    
    # Check if user already exists
    existing_user = auth_service.get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user = auth_service.create_user(user_data)
    token_data = auth_service.create_user_token(user)
    
    # Set authentication cookies
    CookieManager.set_auth_cookies(
        response=response,
        access_token=token_data["access_token"],
        refresh_token=token_data["refresh_token"]
    )
    
    return Token(**token_data)


@router.post("/login", response_model=Token)
async def login(request: Request, user_credentials: UserLogin, response: Response, db: Session = Depends(get_db)):
    """Login with email and password."""
    # Debug: Print the raw request body
    body = await request.body()
    
    auth_service = AuthService(db)
    
    user = auth_service.authenticate_user(user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token_data = auth_service.create_user_token(user)
    
    # Set authentication cookies
    CookieManager.set_auth_cookies(
        response=response,
        access_token=token_data["access_token"],
        refresh_token=token_data["refresh_token"]
    )
    
    return Token(**token_data)


@router.post("/refresh", response_model=Token)
def refresh_token(token_data: TokenRefresh, response: Response, db: Session = Depends(get_db)):
    """Refresh access token using refresh token."""
    auth_service = AuthService(db)
    
    # Verify refresh token
    payload = verify_refresh_token(token_data.refresh_token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        user_id_int = int(user_id)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID in refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user
    user = auth_service.get_user_by_id(user_id_int)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create new tokens
    token_data = auth_service.create_user_token(user)
    
    # Set authentication cookies
    CookieManager.set_auth_cookies(
        response=response,
        access_token=token_data["access_token"],
        refresh_token=token_data["refresh_token"]
    )
    
    return Token(**token_data)


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: UserResponse = Depends(get_current_user)):
    """Get current user information."""
    return current_user


@router.post("/google/callback", response_model=Token)
async def google_auth_callback(auth_request: GoogleAuthRequest, response: Response, db: Session = Depends(get_db)):
    """Handle Google OAuth callback with ID token."""
    auth_service = AuthService(db)
    
    # Get user info from Google ID token
    google_user_info = auth_service.get_google_user_info_from_token(auth_request.code)
    if not google_user_info:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to get user info from Google token"
        )
    
    # Create or update user
    user = auth_service.create_google_user(google_user_info)
    token_data = auth_service.create_user_token(user)
    
    # Set authentication cookies
    CookieManager.set_auth_cookies(
        response=response,
        access_token=token_data["access_token"],
        refresh_token=token_data["refresh_token"]
    )
    
    return Token(**token_data)


@router.post("/logout")
def logout(response: Response):
    """Logout user and clear authentication cookies."""
    # Clear authentication cookies
    CookieManager.clear_auth_cookies(response)
    
    return {"message": "Successfully logged out"}


@router.get("/google/url")
def get_google_auth_url():
    """Get Google OAuth URL."""
    google_auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={settings.GOOGLE_CLIENT_ID}&"
        "response_type=code&"
        "scope=openid email profile&"
        f"redirect_uri={settings.GOOGLE_REDIRECT_URI}&"
        "access_type=offline"
    )
    return {"auth_url": google_auth_url} 