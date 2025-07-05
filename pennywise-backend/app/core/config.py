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
    
    # Server settings
    HOST: str = Field(default="0.0.0.0", env="HOST")
    PORT: int = Field(default=8000, env="PORT")
    
    # Database settings
    DB_USER: str = Field(env="DB_USER")
    DB_PASSWORD: str = Field(env="DB_PASSWORD")
    DB_HOST: str = Field(default="localhost", env="DB_HOST")
    DB_PORT: str = Field(default="5432", env="DB_PORT")
    DB_NAME: str = Field(env="DB_NAME")
    
    # CORS settings
    ALLOWED_ORIGINS: List[str] = Field(default=["http://localhost:3000"], env="ALLOWED_ORIGINS")
    ALLOWED_HOSTS: List[str] = Field(default=["*"], env="ALLOWED_HOSTS")
    
    # JWT settings
    SECRET_KEY: str = Field(env="SECRET_KEY", default="your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Google OAuth settings
    GOOGLE_CLIENT_ID: str = Field(env="GOOGLE_CLIENT_ID", default="")
    GOOGLE_CLIENT_SECRET: str = Field(env="GOOGLE_CLIENT_SECRET", default="")
    GOOGLE_REDIRECT_URI: str = Field(env="GOOGLE_REDIRECT_URI", default="http://localhost:8000/api/v1/auth/google/callback")
    
    # Health polling settings
    HEALTH_POLLING_ENABLED: bool = Field(default=True, env="HEALTH_POLLING_ENABLED")
    HEALTH_POLLING_INTERVAL: int = Field(default=300, env="HEALTH_POLLING_INTERVAL")  # 5 minutes in seconds
    
    @field_validator("ALLOWED_ORIGINS", mode="before")
    def split_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
