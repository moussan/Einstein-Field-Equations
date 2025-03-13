from datetime import datetime, timedelta
from typing import Any, Optional, Union
from functools import lru_cache

from jose import jwt
from passlib.context import CryptContext
from ..config.settings import settings

# Configure password hashing with bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Cache token creation for the same subject and expiration time
@lru_cache(maxsize=128)
def _create_token_cached(subject: str, expires_delta_seconds: int) -> str:
    """Cached version of token creation to improve performance."""
    expire = datetime.utcnow() + timedelta(seconds=expires_delta_seconds)
    to_encode = {"exp": expire, "sub": subject}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_access_token(
    subject: Union[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT access token.
    
    Args:
        subject: The subject of the token, typically the user ID
        expires_delta: Optional expiration time delta
        
    Returns:
        JWT token as string
    """
    if expires_delta:
        expires_seconds = int(expires_delta.total_seconds())
    else:
        expires_seconds = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    
    # Convert subject to string for caching
    subject_str = str(subject)
    
    # Use cached version for better performance
    return _create_token_cached(subject_str, expires_seconds)

# Cache password verification results to improve performance
@lru_cache(maxsize=128)
def _verify_password_cached(plain_password: str, hashed_password: str) -> bool:
    """Cached version of password verification to improve performance."""
    return pwd_context.verify(plain_password, hashed_password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against a hash.
    
    Args:
        plain_password: The plain-text password
        hashed_password: The hashed password
        
    Returns:
        True if password matches hash, False otherwise
    """
    return _verify_password_cached(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """
    Hash a password.
    
    Args:
        password: The plain-text password
        
    Returns:
        Hashed password
    """
    return pwd_context.hash(password)

def verify_firebase_token(token: str) -> Optional[str]:
    """
    Verify a Firebase ID token.
    
    Args:
        token: The Firebase ID token
        
    Returns:
        The Firebase UID if token is valid, None otherwise
    """
    # This is a placeholder. In a real implementation, you would use Firebase Admin SDK
    # to verify the token and extract the UID.
    # Example:
    # from firebase_admin import auth
    # try:
    #     decoded_token = auth.verify_id_token(token)
    #     return decoded_token['uid']
    # except Exception as e:
    #     return None
    
    # For now, we'll just return a dummy UID for testing
    return "firebase-uid-123" 