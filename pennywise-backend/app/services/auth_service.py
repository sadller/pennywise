import httpx
import jwt
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.auth import UserCreate, UserLogin
from app.utils.auth import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from typing import Optional


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        return self.db.query(User).filter(User.email == email).first()

    def get_user_by_google_id(self, google_id: str) -> Optional[User]:
        """Get user by Google ID."""
        return self.db.query(User).filter(User.google_id == google_id).first()

    def create_user(self, user_data: UserCreate) -> User:
        """Create a new user."""
        hashed_password = None
        if user_data.password:
            hashed_password = get_password_hash(user_data.password)

        db_user = User(
            email=user_data.email,
            username=user_data.username,
            password=hashed_password,
            full_name=user_data.full_name,
            auth_provider="email"
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password."""
        user = self.get_user_by_email(email)
        if not user or not user.password:
            return None
        if not verify_password(password, user.password):
            return None
        return user

    def create_google_user(self, google_data: dict) -> User:
        """Create or update user from Google OAuth data."""
        google_id = google_data.get("sub")
        email = google_data.get("email")
        full_name = google_data.get("name")
        avatar_url = google_data.get("picture")

        # Check if user exists by Google ID
        user = self.get_user_by_google_id(google_id)
        if user:
            # Update existing user
            user.full_name = full_name
            user.avatar_url = avatar_url
            self.db.commit()
            self.db.refresh(user)
            return user

        # Check if user exists by email
        user = self.get_user_by_email(email)
        if user:
            # Link Google account to existing user
            user.google_id = google_id
            user.avatar_url = avatar_url
            user.auth_provider = "google"
            self.db.commit()
            self.db.refresh(user)
            return user

        # Create new user
        db_user = User(
            email=email,
            google_id=google_id,
            full_name=full_name,
            avatar_url=avatar_url,
            auth_provider="google"
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def get_google_user_info_from_token(self, id_token: str) -> Optional[dict]:
        """Get user info from Google ID token."""
        try:
            # Decode the ID token without verification (for development)
            # In production, you should verify the token signature
            decoded_token = jwt.decode(id_token, options={"verify_signature": False})
            
            # Extract user information
            user_info = {
                "sub": decoded_token.get("sub"),
                "email": decoded_token.get("email"),
                "name": decoded_token.get("name"),
                "picture": decoded_token.get("picture"),
                "given_name": decoded_token.get("given_name"),
                "family_name": decoded_token.get("family_name"),
            }
            
            return user_info
        except Exception as e:
            print(f"Error decoding Google ID token: {e}")
            return None

    async def get_google_user_info(self, code: str) -> Optional[dict]:
        """Get user info from Google using authorization code."""
        # Exchange code for tokens
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        }

        async with httpx.AsyncClient() as client:
            token_response = await client.post(token_url, data=token_data)
            if token_response.status_code != 200:
                return None

            token_info = token_response.json()
            access_token = token_info.get("access_token")

            # Get user info
            user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
            headers = {"Authorization": f"Bearer {access_token}"}
            user_response = await client.get(user_info_url, headers=headers)

            if user_response.status_code != 200:
                return None

            return user_response.json()

    def create_user_token(self, user: User) -> dict:
        """Create access token for user."""
        access_token = create_access_token(data={"sub": str(user.id)})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": user.id,
            "email": user.email,
            "full_name": user.full_name
        } 