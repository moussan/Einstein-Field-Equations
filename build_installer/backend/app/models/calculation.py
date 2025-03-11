from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..config.database import Base
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# Calculation types enum
class CalculationType(str, Enum):
    VACUUM = "vacuum"
    MATTER = "matter"
    WEAK_FIELD = "weak-field"
    SCHWARZSCHILD = "schwarzschild"
    KERR = "kerr"
    REISSNER_NORDSTROM = "reissner-nordstrom"
    KERR_NEWMAN = "kerr-newman"
    FLRW = "flrw"
    CHRISTOFFEL = "christoffel"
    GEODESIC = "geodesic"
    RICCI_TENSOR = "ricci-tensor"
    RIEMANN_TENSOR = "riemann-tensor"
    WEYL_TENSOR = "weyl-tensor"
    ENERGY_CONDITIONS = "energy-conditions"

# Coordinate system enum
class CoordinateSystem(str, Enum):
    SPHERICAL = "spherical"
    CARTESIAN = "cartesian"
    CYLINDRICAL = "cylindrical"
    BOYER_LINDQUIST = "boyer-lindquist"
    EDDINGTON_FINKELSTEIN = "eddington-finkelstein"
    KRUSKAL_SZEKERES = "kruskal-szekeres"

# SQLAlchemy Calculation model
class Calculation(Base):
    __tablename__ = "calculations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String, index=True)  # One of CalculationType
    description = Column(String, nullable=True)
    inputs = Column(JSON, nullable=False)  # Store input parameters as JSON
    results = Column(JSON, nullable=True)  # Store calculation results as JSON
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    calculation_time = Column(Float, nullable=True)  # Time taken to perform calculation in seconds
    is_public = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User", back_populates="calculations")
    
    def __repr__(self):
        return f"<Calculation {self.id}: {self.type}>"

# Add relationship to User model
from .user import User
User.calculations = relationship("Calculation", back_populates="user")

# Pydantic models for API
class CalculationBase(BaseModel):
    type: CalculationType
    description: Optional[str] = None
    inputs: Dict[str, Any]
    is_public: bool = False

class CalculationCreate(CalculationBase):
    pass

class CalculationUpdate(BaseModel):
    description: Optional[str] = None
    inputs: Optional[Dict[str, Any]] = None
    results: Optional[Dict[str, Any]] = None
    is_public: Optional[bool] = None

class CalculationInDB(CalculationBase):
    id: int
    user_id: int
    results: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    calculation_time: Optional[float] = None
    
    class Config:
        orm_mode = True

class Calculation(CalculationInDB):
    pass

# Input models for specific calculation types
class VacuumEFEInput(BaseModel):
    coordinates: CoordinateSystem = CoordinateSystem.SPHERICAL
    include_cosmological_constant: bool = False
    cosmological_constant: Optional[float] = None
    mass: float = 1.0
    description: Optional[str] = None

class MatterEFEInput(BaseModel):
    coordinates: CoordinateSystem = CoordinateSystem.SPHERICAL
    include_cosmological_constant: bool = False
    cosmological_constant: Optional[float] = None
    mass: float = 1.0
    pressure: float = 0.0
    energy_density: float = 0.0
    description: Optional[str] = None

class SchwarzschildInput(BaseModel):
    mass: float = 1.0  # Mass in solar masses
    coordinates: CoordinateSystem = CoordinateSystem.SPHERICAL
    include_cosmological_constant: bool = False
    cosmological_constant: Optional[float] = None
    description: Optional[str] = None

class KerrInput(BaseModel):
    mass: float = 1.0  # Mass in solar masses
    angular_momentum: float = 0.5  # Dimensionless spin parameter a/M
    coordinates: CoordinateSystem = CoordinateSystem.BOYER_LINDQUIST
    description: Optional[str] = None

class ChristoffelInput(BaseModel):
    metric_type: CalculationType = CalculationType.SCHWARZSCHILD
    coordinates: CoordinateSystem = CoordinateSystem.SPHERICAL
    mass: Optional[float] = 1.0
    angular_momentum: Optional[float] = None
    charge: Optional[float] = None
    custom_metric: Optional[Dict[str, Any]] = None
    description: Optional[str] = None

# Pagination model
class PaginatedCalculations(BaseModel):
    total: int
    page: int
    page_size: int
    calculations: List[Calculation] 