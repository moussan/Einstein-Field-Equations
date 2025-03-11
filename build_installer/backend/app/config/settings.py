import os
from pydantic import BaseSettings
from dotenv import load_dotenv
from typing import List, Optional

# Load environment variables
load_dotenv()

class Settings(BaseSettings):
    # API settings
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "Einstein Field Equations Computational Platform"
    
    # CORS settings
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",  # React development server
        "http://localhost:5000",  # Production frontend
        "https://efecp.example.com",  # Production domain (replace with actual domain)
    ]
    
    # JWT settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-for-jwt-please-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./efecp.db")
    
    # Firebase settings (for authentication)
    FIREBASE_API_KEY: Optional[str] = os.getenv("FIREBASE_API_KEY")
    FIREBASE_AUTH_DOMAIN: Optional[str] = os.getenv("FIREBASE_AUTH_DOMAIN")
    FIREBASE_PROJECT_ID: Optional[str] = os.getenv("FIREBASE_PROJECT_ID")
    FIREBASE_STORAGE_BUCKET: Optional[str] = os.getenv("FIREBASE_STORAGE_BUCKET")
    FIREBASE_MESSAGING_SENDER_ID: Optional[str] = os.getenv("FIREBASE_MESSAGING_SENDER_ID")
    FIREBASE_APP_ID: Optional[str] = os.getenv("FIREBASE_APP_ID")
    
    # Computation settings
    MAX_CALCULATION_TIME: int = 60  # Maximum time in seconds for a calculation
    ENABLE_GPU_ACCELERATION: bool = os.getenv("ENABLE_GPU_ACCELERATION", "False").lower() == "true"
    
    # Cache settings
    REDIS_URL: Optional[str] = os.getenv("REDIS_URL")
    CACHE_EXPIRATION: int = 3600  # Cache expiration time in seconds (1 hour)
    
    # Logging settings
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE: str = os.getenv("LOG_FILE", "logs/efecp.log")
    
    class Config:
        case_sensitive = True
        env_file = ".env"

# Create settings instance
settings = Settings()

# Export settings
__all__ = ["settings"]