from datetime import timedelta
from typing import Any, Dict
import time
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ...core.security import create_access_token, verify_password, get_password_hash, verify_firebase_token
from ...config.settings import settings
from ...models.user import User, Token, UserCreate, UserInDB
from ..deps import get_db, get_current_user

router = APIRouter()

# Simple rate limiting implementation
# In production, use Redis or another distributed solution
_login_attempts: Dict[str, Dict[str, Any]] = defaultdict(lambda: {"count": 0, "reset_at": 0})
_max_attempts = 5
_rate_limit_window = 300  # 5 minutes in seconds

def _check_rate_limit(ip_address: str) -> bool:
    """Check if the IP address is rate limited."""
    now = time.time()
    
    # Reset counter if window has passed
    if _login_attempts[ip_address]["reset_at"] < now:
        _login_attempts[ip_address] = {"count": 0, "reset_at": now + _rate_limit_window}
    
    # Check if over limit
    if _login_attempts[ip_address]["count"] >= _max_attempts:
        return False
    
    # Increment counter
    _login_attempts[ip_address]["count"] += 1
    return True

@router.post("/login", response_model=Token)
def login_access_token(
    request: Request,
    db: Session = Depends(get_db), 
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    # Get client IP for rate limiting
    client_ip = request.client.host
    
    # Check rate limiting
    if not _check_rate_limit(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again later.",
        )
    
    # Validate credentials
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )
    
    # Update last login timestamp
    user.last_login = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    db.commit()
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/signup", response_model=UserInDB)
def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
) -> Any:
    """
    Create new user.
    """
    # Check if user already exists
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system",
        )
    
    # Create new user
    try:
        user = User(
            email=user_in.email,
            hashed_password=get_password_hash(user_in.password),
            display_name=user_in.display_name,
            is_active=True,
            is_admin=False,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating user: {str(e)}",
        )

@router.post("/firebase-login", response_model=Token)
def login_firebase(
    *,
    request: Request,
    db: Session = Depends(get_db),
    firebase_token: str,
) -> Any:
    """
    Firebase token login, get an access token for future requests.
    """
    # Get client IP for rate limiting
    client_ip = request.client.host
    
    # Check rate limiting
    if not _check_rate_limit(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again later.",
        )
    
    # Verify Firebase token
    firebase_uid = verify_firebase_token(firebase_token)
    if not firebase_uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Firebase token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user by Firebase UID
    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    if not user:
        # In a real application, you might want to create a new user here
        # based on Firebase user data
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )
    
    # Update last login timestamp
    user.last_login = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    db.commit()
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/test-token", response_model=UserInDB)
def test_token(current_user: User = Depends(get_current_user)) -> Any:
    """
    Test access token.
    """
    return current_user

@router.post("/reset-password")
def reset_password(
    *,
    request: Request,
    db: Session = Depends(get_db),
    email: str,
) -> Any:
    """
    Password recovery.
    """
    # Get client IP for rate limiting
    client_ip = request.client.host
    
    # Check rate limiting
    if not _check_rate_limit(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many password reset attempts. Please try again later.",
        )
    
    # Find user by email
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Don't reveal that the user doesn't exist
        return {"msg": "Password reset email sent"}
    
    # In a real application, you would send an email with a password reset link
    # For now, we'll just return a success message
    return {"msg": "Password reset email sent"} 