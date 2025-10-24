from fastapi import Response
from datetime import datetime, timedelta, timezone
from app.core.config import settings


class CookieManager:
    """Utility class for managing authentication cookies"""
    
    AUTH_TOKEN_COOKIE = "auth_token"
    REFRESH_TOKEN_COOKIE = "refresh_token"
    
    @staticmethod
    def set_auth_cookies(
        response: Response,
        access_token: str,
        refresh_token: str,
        access_token_expires_minutes: int = None,
        refresh_token_expires_days: int = None
    ) -> None:
        """Set authentication cookies in the response"""
        
        # Use default values from settings if not provided
        if access_token_expires_minutes is None:
            access_token_expires_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES
        if refresh_token_expires_days is None:
            refresh_token_expires_days = settings.REFRESH_TOKEN_EXPIRE_DAYS
        
        # Calculate expiration times
        access_token_expires = datetime.now(timezone.utc) + timedelta(minutes=access_token_expires_minutes)
        refresh_token_expires = datetime.now(timezone.utc) + timedelta(days=refresh_token_expires_days)
        
        # Set access token cookie
        response.set_cookie(
            key=CookieManager.AUTH_TOKEN_COOKIE,
            value=access_token,
            expires=access_token_expires,
            httponly=settings.COOKIE_HTTPONLY,
            secure=settings.COOKIE_SECURE,
            samesite=settings.COOKIE_SAMESITE,
            path="/"
        )
        
        # Set refresh token cookie
        response.set_cookie(
            key=CookieManager.REFRESH_TOKEN_COOKIE,
            value=refresh_token,
            expires=refresh_token_expires,
            httponly=settings.COOKIE_HTTPONLY,
            secure=settings.COOKIE_SECURE,
            samesite=settings.COOKIE_SAMESITE,
            path="/"
        )
    
    @staticmethod
    def clear_auth_cookies(response: Response) -> None:
        """Clear authentication cookies from the response"""
        
        # Clear access token cookie
        response.delete_cookie(
            key=CookieManager.AUTH_TOKEN_COOKIE,
            path="/",
            samesite=settings.COOKIE_SAMESITE,
            secure=settings.COOKIE_SECURE
        )
        
        # Clear refresh token cookie
        response.delete_cookie(
            key=CookieManager.REFRESH_TOKEN_COOKIE,
            path="/",
            samesite=settings.COOKIE_SAMESITE,
            secure=settings.COOKIE_SECURE
        )

