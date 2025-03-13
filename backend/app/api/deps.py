from typing import Generator, Optional, Dict, Any
from functools import lru_cache
import time

from fastapi import Depends, HTTPException, status, Header, Request
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.orm import Session

from ..config.database import SessionLocal
from ..config.settings import settings
from ..core.security import verify_firebase_token
from ..models.user import User, TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

# Simple in-memory cache for user objects
# In production, consider using Redis or another distributed cache
_user_cache: Dict[int, Dict[str, Any]] = {}
_cache_ttl = 300  # 5 minutes in seconds

def _get_cached_user(user_id: int) -> Optional[Dict[str, Any]]:
    """Get user from cache if it exists and is not expired."""
    if user_id in _user_cache:
        cache_entry = _user_cache[user_id]
        if time.time() - cache_entry["timestamp"] < _cache_ttl:
            return cache_entry["user"]
    return None

def _cache_user(user_id: int, user_dict: Dict[str, Any]) -> None:
    """Cache user with timestamp."""
    _user_cache[user_id] = {
        "user": user_dict,
        "timestamp": time.time()
    }

def get_db() -> Generator:
    """
    Dependency for getting a database session.
    
    Yields:
        SQLAlchemy Session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> User:
    """
    Dependency for getting the current authenticated user.
    
    Args:
        db: Database session
        token: JWT token
        
    Returns:
        User object
        
    Raises:
        HTTPException: If authentication fails
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id = int(payload["sub"])
        
        # Try to get user from cache first
        cached_user = _get_cached_user(user_id)
        if cached_user:
            # Convert dict back to User object
            user = User()
            for key, value in cached_user.items():
                setattr(user, key, value)
            return user
            
    except (JWTError, ValidationError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # If not in cache, get from database
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )
    
    # Cache user for future requests
    user_dict = {c.name: getattr(user, c.name) for c in user.__table__.columns}
    _cache_user(user_id, user_dict)
    
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency for getting the current active user.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User object
        
    Raises:
        HTTPException: If user is inactive
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )
    return current_user

def get_current_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency for getting the current admin user.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User object
        
    Raises:
        HTTPException: If user is not an admin
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )
    return current_user

def get_firebase_user(
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
) -> User:
    """
    Dependency for getting the current user authenticated with Firebase.
    
    Args:
        db: Database session
        authorization: Firebase ID token in Authorization header
        
    Returns:
        User object
        
    Raises:
        HTTPException: If authentication fails
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = authorization.replace("Bearer ", "")
    firebase_uid = verify_firebase_token(token)
    
    if not firebase_uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    if not user:
        # In a real application, you might want to create a new user here
        # or handle this case differently
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )
    
    return user 