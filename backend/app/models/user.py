from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from ..config.database import Base
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# SQLAlchemy User model
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    display_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    firebase_uid = Column(String, nullable=True, unique=True)
    
    def __repr__(self):
        return f"<User {self.email}>"

# Pydantic models for API
class UserBase(BaseModel):
    email: EmailStr
    display_name: Optional[str] = None
    
class UserCreate(UserBase):
    password: str
    
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    display_name: Optional[str] = None
    password: Optional[str] = None
    
class UserInDB(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    
    class Config:
        orm_mode = True
        
class User(UserInDB):
    pass

# Token models
class Token(BaseModel):
    access_token: str
    token_type: str
    
class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None 