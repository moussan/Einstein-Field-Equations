import logging
from sqlalchemy.orm import Session
from ..models.user import User
from ..core.security import get_password_hash
from ..config.settings import settings

logger = logging.getLogger(__name__)

# Initial admin user
FIRST_ADMIN = {
    "email": "admin@example.com",
    "password": "adminpassword",  # This will be hashed
    "display_name": "Admin",
    "is_admin": True
}

def init_db(db: Session) -> None:
    """Initialize the database with required initial data."""
    # Create admin user if it doesn't exist
    user = db.query(User).filter(User.email == FIRST_ADMIN["email"]).first()
    if not user:
        user = User(
            email=FIRST_ADMIN["email"],
            hashed_password=get_password_hash(FIRST_ADMIN["password"]),
            display_name=FIRST_ADMIN["display_name"],
            is_active=True,
            is_admin=FIRST_ADMIN["is_admin"]
        )
        db.add(user)
        db.commit()
        logger.info(f"Created admin user: {FIRST_ADMIN['email']}")
    else:
        logger.info(f"Admin user already exists: {FIRST_ADMIN['email']}")

    # Add other initialization as needed
    # For example, creating default calculation templates, etc.
    
    logger.info("Database initialization completed") 