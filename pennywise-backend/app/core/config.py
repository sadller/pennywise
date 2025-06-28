from typing import List
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Application settings
    APP_NAME: str = "Pennywise API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = Field(default=False, env="DEBUG")
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    
    # API settings
    API_V1_STR: str = "/api/v1"
    
    # Database settings
    DATABASE_URL: str = Field(env="DATABASE_URL")
    
    # CORS settings
    ALLOWED_ORIGINS: List[str] = Field(default=["http://localhost:3000"], env="ALLOWED_ORIGINS")
    ALLOWED_HOSTS: List[str] = Field(default=["*"], env="ALLOWED_HOSTS")
    
    # JWT settings
    SECRET_KEY: str = Field(env="SECRET_KEY", default="your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Google OAuth settings
    GOOGLE_CLIENT_ID: str = Field(env="GOOGLE_CLIENT_ID", default="")
    GOOGLE_CLIENT_SECRET: str = Field(env="GOOGLE_CLIENT_SECRET", default="")
    GOOGLE_REDIRECT_URI: str = Field(env="GOOGLE_REDIRECT_URI", default="http://localhost:8000/api/v1/auth/google/callback")
    
    @field_validator("ALLOWED_ORIGINS", mode="before")
    def split_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
