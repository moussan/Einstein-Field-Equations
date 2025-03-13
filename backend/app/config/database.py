from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL from environment variables or use default
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./efecp.db")

# Create SQLAlchemy engine with optimized settings
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
    # Add connection pooling settings for better performance
    pool_size=5,  # Default number of connections to keep open
    max_overflow=10,  # Allow up to 10 connections beyond pool_size
    pool_timeout=30,  # Timeout for getting a connection from the pool
    pool_recycle=1800,  # Recycle connections after 30 minutes
    echo=False  # Set to True for debugging SQL queries
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 