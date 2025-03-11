from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ...models.calculation import (
    Calculation, CalculationCreate, CalculationUpdate, CalculationInDB,
    PaginatedCalculations, CalculationType, VacuumEFEInput, MatterEFEInput,
    SchwarzschildInput, KerrInput, ChristoffelInput
)
from ...models.user import User
from ...services.calculation_service import perform_calculation
from ..deps import get_db, get_current_active_user

router = APIRouter()

@router.get("/", response_model=PaginatedCalculations)
def read_calculations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100,
    calculation_type: Optional[CalculationType] = None,
    include_public: bool = False,
) -> Any:
    """
    Retrieve calculations.
    """
    # Base query for user's calculations
    query = db.query(Calculation).filter(Calculation.user_id == current_user.id)
    
    # Filter by calculation type if specified
    if calculation_type:
        query = query.filter(Calculation.type == calculation_type)
    
    # Include public calculations from other users if requested
    if include_public:
        public_query = db.query(Calculation).filter(
            Calculation.is_public == True,
            Calculation.user_id != current_user.id
        )
        if calculation_type:
            public_query = public_query.filter(Calculation.type == calculation_type)
        
        # Union the queries
        query = query.union(public_query)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    calculations = query.order_by(Calculation.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "page": skip // limit + 1,
        "page_size": limit,
        "calculations": calculations
    }

@router.post("/", response_model=CalculationInDB)
def create_calculation(
    *,
    db: Session = Depends(get_db),
    calculation_in: CalculationCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Create new calculation.
    """
    # Create calculation record
    calculation = Calculation(
        user_id=current_user.id,
        type=calculation_in.type,
        description=calculation_in.description,
        inputs=calculation_in.inputs,
        is_public=calculation_in.is_public
    )
    
    # Perform the calculation
    try:
        start_time = db.execute("SELECT CURRENT_TIMESTAMP").scalar()
        results = perform_calculation(calculation_in.type, calculation_in.inputs)
        end_time = db.execute("SELECT CURRENT_TIMESTAMP").scalar()
        
        # Calculate time taken
        calculation_time = (end_time - start_time).total_seconds()
        
        # Update calculation with results
        calculation.results = results
        calculation.calculation_time = calculation_time
    except Exception as e:
        # Still save the calculation even if it fails
        calculation.results = {"error": str(e)}
    
    db.add(calculation)
    db.commit()
    db.refresh(calculation)
    return calculation

@router.get("/{calculation_id}", response_model=CalculationInDB)
def read_calculation(
    *,
    db: Session = Depends(get_db),
    calculation_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get calculation by ID.
    """
    calculation = db.query(Calculation).filter(Calculation.id == calculation_id).first()
    if not calculation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calculation not found",
        )
    
    # Check if user has access to this calculation
    if calculation.user_id != current_user.id and not calculation.is_public:
        if not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions",
            )
    
    return calculation

@router.put("/{calculation_id}", response_model=CalculationInDB)
def update_calculation(
    *,
    db: Session = Depends(get_db),
    calculation_id: int,
    calculation_in: CalculationUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Update a calculation.
    """
    calculation = db.query(Calculation).filter(Calculation.id == calculation_id).first()
    if not calculation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calculation not found",
        )
    
    # Check if user has access to update this calculation
    if calculation.user_id != current_user.id:
        if not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions",
            )
    
    # Update fields
    update_data = calculation_in.dict(exclude_unset=True)
    for field in update_data:
        setattr(calculation, field, update_data[field])
    
    # If inputs were updated, recalculate
    if "inputs" in update_data:
        try:
            start_time = db.execute("SELECT CURRENT_TIMESTAMP").scalar()
            results = perform_calculation(calculation.type, calculation.inputs)
            end_time = db.execute("SELECT CURRENT_TIMESTAMP").scalar()
            
            # Calculate time taken
            calculation_time = (end_time - start_time).total_seconds()
            
            # Update calculation with results
            calculation.results = results
            calculation.calculation_time = calculation_time
        except Exception as e:
            # Still save the calculation even if it fails
            calculation.results = {"error": str(e)}
    
    db.add(calculation)
    db.commit()
    db.refresh(calculation)
    return calculation

@router.delete("/{calculation_id}", response_model=CalculationInDB)
def delete_calculation(
    *,
    db: Session = Depends(get_db),
    calculation_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Delete a calculation.
    """
    calculation = db.query(Calculation).filter(Calculation.id == calculation_id).first()
    if not calculation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calculation not found",
        )
    
    # Check if user has access to delete this calculation
    if calculation.user_id != current_user.id:
        if not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions",
            )
    
    db.delete(calculation)
    db.commit()
    return calculation

# Specialized endpoints for different calculation types
@router.post("/vacuum-efe", response_model=CalculationInDB)
def calculate_vacuum_efe(
    *,
    db: Session = Depends(get_db),
    input_data: VacuumEFEInput,
    is_public: bool = False,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Perform a vacuum Einstein Field Equations calculation.
    """
    # Create calculation input
    calculation_in = CalculationCreate(
        type=CalculationType.VACUUM,
        description=input_data.description or "Vacuum Einstein Field Equations",
        inputs=input_data.dict(),
        is_public=is_public
    )
    
    # Use the generic create_calculation function
    return create_calculation(
        db=db, calculation_in=calculation_in, current_user=current_user
    )

@router.post("/matter-efe", response_model=CalculationInDB)
def calculate_matter_efe(
    *,
    db: Session = Depends(get_db),
    input_data: MatterEFEInput,
    is_public: bool = False,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Perform a matter Einstein Field Equations calculation.
    """
    # Create calculation input
    calculation_in = CalculationCreate(
        type=CalculationType.MATTER,
        description=input_data.description or "Matter Einstein Field Equations",
        inputs=input_data.dict(),
        is_public=is_public
    )
    
    # Use the generic create_calculation function
    return create_calculation(
        db=db, calculation_in=calculation_in, current_user=current_user
    )

@router.post("/schwarzschild", response_model=CalculationInDB)
def calculate_schwarzschild(
    *,
    db: Session = Depends(get_db),
    input_data: SchwarzschildInput,
    is_public: bool = False,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Perform a Schwarzschild metric calculation.
    """
    # Create calculation input
    calculation_in = CalculationCreate(
        type=CalculationType.SCHWARZSCHILD,
        description=input_data.description or "Schwarzschild Metric",
        inputs=input_data.dict(),
        is_public=is_public
    )
    
    # Use the generic create_calculation function
    return create_calculation(
        db=db, calculation_in=calculation_in, current_user=current_user
    )

@router.post("/kerr", response_model=CalculationInDB)
def calculate_kerr(
    *,
    db: Session = Depends(get_db),
    input_data: KerrInput,
    is_public: bool = False,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Perform a Kerr metric calculation.
    """
    # Create calculation input
    calculation_in = CalculationCreate(
        type=CalculationType.KERR,
        description=input_data.description or "Kerr Metric",
        inputs=input_data.dict(),
        is_public=is_public
    )
    
    # Use the generic create_calculation function
    return create_calculation(
        db=db, calculation_in=calculation_in, current_user=current_user
    )

@router.post("/christoffel", response_model=CalculationInDB)
def calculate_christoffel(
    *,
    db: Session = Depends(get_db),
    input_data: ChristoffelInput,
    is_public: bool = False,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Calculate Christoffel symbols for a given metric.
    """
    # Create calculation input
    calculation_in = CalculationCreate(
        type=CalculationType.CHRISTOFFEL,
        description=input_data.description or "Christoffel Symbols",
        inputs=input_data.dict(),
        is_public=is_public
    )
    
    # Use the generic create_calculation function
    return create_calculation(
        db=db, calculation_in=calculation_in, current_user=current_user
    ) 