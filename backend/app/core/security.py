from datetime import datetime, timedelta
from typing import Any, Optional, Union

from jose import jwt
from passlib.context import CryptContext
from ..config.settings import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against a hash.
    
    Args:
        plain_password: The plain-text password
        hashed_password: The hashed password
        
    Returns:
        True if password matches hash, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)

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