from fastapi import FastAPI, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import numpy as np

from app.physics.tensors import (
    calculate_christoffel_symbols,
    calculate_riemann_tensor,
    calculate_ricci_tensor,
    calculate_ricci_scalar
)
from app.core.cache import cache_response, get_cache_stats

class MetricInput(BaseModel):
    mass: float = Field(..., gt=0, description="Mass of the black hole (M > 0)")
    radius: float = Field(..., gt=0, description="Radial coordinate (r > 0)")
    theta: float = Field(..., ge=0, le=np.pi, description="Angular coordinate (0 ≤ θ ≤ π)")

class KerrInput(MetricInput):
    angular_momentum: float = Field(..., description="Angular momentum per unit mass")

class ReissnerNordstromInput(MetricInput):
    charge: float = Field(..., description="Electric charge of the black hole")

class MetricResponse(BaseModel):
    metric_components: dict[str, float]
    event_horizon: float | None = Field(None, description="Location of the outer event horizon")
    cauchy_horizon: float | None = Field(None, description="Location of the inner (Cauchy) horizon, if it exists")
    christoffel_symbols: dict[str, float] | None = Field(None, description="Non-zero Christoffel symbols")
    riemann_tensor: dict[str, float] | None = Field(None, description="Non-zero Riemann tensor components")
    ricci_tensor: dict[str, float] | None = Field(None, description="Non-zero Ricci tensor components")
    ricci_scalar: float | None = Field(None, description="Ricci scalar (scalar curvature)")

app = FastAPI(
    title="Einstein Field Equations API",
    description="""
    API for calculating Einstein Field Equations and related metrics in General Relativity.
    
    This API provides endpoints for calculating various black hole metrics:
    - Schwarzschild metric (static, uncharged black hole)
    - Kerr metric (rotating black hole)
    - Reissner-Nordström metric (charged, non-rotating black hole)
    
    For each metric, the API calculates:
    - Metric components (g_μν)
    - Event horizons
    - Christoffel symbols (Γᵍₐᵦ)
    - Riemann curvature tensor (Rᵈₐᵦᵧ)
    - Ricci tensor (Rᵢⱼ)
    - Ricci scalar (R)
    
    All calculations use geometric units where G = c = 1.
    """,
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

@app.get("/cache/stats")
async def cache_stats():
    """Get cache statistics."""
    return get_cache_stats()

@app.post("/api/v1/calculate/schwarzschild", response_model=MetricResponse)
@cache_response(ttl=3600)
async def calculate_schwarzschild(input_data: MetricInput):
    """
    Calculate Schwarzschild metric components and derived quantities.
    
    The Schwarzschild metric describes the geometry of spacetime around a static,
    spherically symmetric mass (like a non-rotating black hole).
    
    The line element is:
    ds² = -(1 - 2M/r)dt² + (1 - 2M/r)⁻¹dr² + r²(dθ² + sin²θ dφ²)
    
    Parameters:
    - mass (M): Mass of the black hole
    - radius (r): Radial coordinate
    - theta (θ): Angular coordinate
    
    Returns:
    - Metric components (g_μν)
    - Event horizon location (r = 2M)
    - Christoffel symbols
    - Curvature tensors
    """
    try:
        # Calculate Schwarzschild radius
        rs = 2 * input_data.mass
        
        # Calculate metric components
        g_tt = -(1 - rs / input_data.radius)
        g_rr = 1 / (1 - rs / input_data.radius)
        g_theta_theta = input_data.radius * input_data.radius
        g_phi_phi = input_data.radius * input_data.radius * np.sin(input_data.theta) * np.sin(input_data.theta)
        
        metric = {
            "g_tt": float(g_tt),
            "g_rr": float(g_rr),
            "g_theta_theta": float(g_theta_theta),
            "g_phi_phi": float(g_phi_phi)
        }
        
        # Calculate tensors
        coords = {
            "mass": input_data.mass,
            "radius": input_data.radius,
            "theta": input_data.theta,
            "metric_type": "schwarzschild"
        }
        
        christoffel = calculate_christoffel_symbols(metric, coords)
        riemann = calculate_riemann_tensor(metric, christoffel, coords)
        ricci = calculate_ricci_tensor(riemann)
        ricci_scalar = calculate_ricci_scalar(ricci, metric)
        
        return MetricResponse(
            metric_components=metric,
            event_horizon=float(rs),
            christoffel_symbols=christoffel,
            riemann_tensor=riemann,
            ricci_tensor=ricci,
            ricci_scalar=ricci_scalar
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.post("/api/v1/calculate/kerr", response_model=MetricResponse)
@cache_response(ttl=3600)
async def calculate_kerr(input_data: KerrInput):
    """
    Calculate Kerr metric components and derived quantities.
    
    The Kerr metric describes the geometry of spacetime around a rotating black hole.
    
    The line element is given in Boyer-Lindquist coordinates, where a = J/M is the
    angular momentum per unit mass.
    
    Parameters:
    - mass (M): Mass of the black hole
    - angular_momentum (a): Angular momentum per unit mass
    - radius (r): Radial coordinate
    - theta (θ): Angular coordinate
    
    Returns:
    - Metric components (g_μν)
    - Outer event horizon location (r₊ = M + √(M² - a²))
    - Christoffel symbols
    - Curvature tensors
    """
    try:
        if input_data.angular_momentum * input_data.angular_momentum > input_data.mass * input_data.mass:
            return JSONResponse(
                status_code=400,
                content={"error": "Angular momentum squared cannot exceed mass squared"}
            )
        
        # Calculate parameters
        a = input_data.angular_momentum
        rs = 2 * input_data.mass
        rho2 = input_data.radius * input_data.radius + a * a * np.cos(input_data.theta) * np.cos(input_data.theta)
        delta = input_data.radius * input_data.radius - rs * input_data.radius + a * a
        
        # Calculate metric components
        g_tt = -((1 - rs * input_data.radius / rho2))
        g_rr = rho2 / delta
        g_theta_theta = rho2
        g_phi_phi = (input_data.radius * input_data.radius + a * a + rs * input_data.radius * a * a * 
                    np.sin(input_data.theta) * np.sin(input_data.theta) / rho2) * np.sin(input_data.theta) * np.sin(input_data.theta)
        
        metric = {
            "g_tt": float(g_tt),
            "g_rr": float(g_rr),
            "g_theta_theta": float(g_theta_theta),
            "g_phi_phi": float(g_phi_phi)
        }
        
        # Calculate event horizon (outer)
        event_horizon = input_data.mass + np.sqrt(input_data.mass * input_data.mass - a * a)
        
        # Calculate tensors
        coords = {
            "mass": input_data.mass,
            "radius": input_data.radius,
            "theta": input_data.theta,
            "angular_momentum": input_data.angular_momentum,
            "metric_type": "kerr"
        }
        
        christoffel = calculate_christoffel_symbols(metric, coords)
        riemann = calculate_riemann_tensor(metric, christoffel, coords)
        ricci = calculate_ricci_tensor(riemann)
        ricci_scalar = calculate_ricci_scalar(ricci, metric)
        
        return MetricResponse(
            metric_components=metric,
            event_horizon=float(event_horizon),
            christoffel_symbols=christoffel,
            riemann_tensor=riemann,
            ricci_tensor=ricci,
            ricci_scalar=ricci_scalar
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.post("/api/v1/calculate/reissner-nordstrom", response_model=MetricResponse)
@cache_response(ttl=3600)
async def calculate_reissner_nordstrom(input_data: ReissnerNordstromInput):
    """
    Calculate Reissner-Nordström metric components and derived quantities.
    
    The Reissner-Nordström metric describes the geometry of spacetime around a
    charged, non-rotating, spherically symmetric black hole.
    
    The line element is:
    ds² = -(1 - 2M/r + Q²/r²)dt² + (1 - 2M/r + Q²/r²)⁻¹dr² + r²(dθ² + sin²θ dφ²)
    
    Parameters:
    - mass (M): Mass of the black hole
    - charge (Q): Electric charge of the black hole
    - radius (r): Radial coordinate
    - theta (θ): Angular coordinate
    
    Returns:
    - Metric components (g_μν)
    - Outer event horizon (r₊ = M + √(M² - Q²))
    - Inner (Cauchy) horizon (r₋ = M - √(M² - Q²))
    - Christoffel symbols
    - Curvature tensors
    """
    try:
        if input_data.charge * input_data.charge > input_data.mass * input_data.mass:
            return JSONResponse(
                status_code=400,
                content={"error": "Charge squared cannot exceed mass squared (naked singularity)"}
            )
        
        # Calculate metric function
        f = 1 - 2 * input_data.mass / input_data.radius + input_data.charge * input_data.charge / (input_data.radius * input_data.radius)
        
        # Calculate metric components
        g_tt = -f
        g_rr = 1 / f
        g_theta_theta = input_data.radius * input_data.radius
        g_phi_phi = input_data.radius * input_data.radius * np.sin(input_data.theta) * np.sin(input_data.theta)
        
        metric = {
            "g_tt": float(g_tt),
            "g_rr": float(g_rr),
            "g_theta_theta": float(g_theta_theta),
            "g_phi_phi": float(g_phi_phi)
        }
        
        # Calculate horizons
        discriminant = input_data.mass * input_data.mass - input_data.charge * input_data.charge
        if discriminant >= 0:
            outer_horizon = input_data.mass + np.sqrt(discriminant)
            inner_horizon = input_data.mass - np.sqrt(discriminant)
        else:
            outer_horizon = None
            inner_horizon = None
        
        # Calculate tensors
        coords = {
            "mass": input_data.mass,
            "radius": input_data.radius,
            "theta": input_data.theta,
            "charge": input_data.charge,
            "metric_type": "reissner-nordstrom"
        }
        
        christoffel = calculate_christoffel_symbols(metric, coords)
        riemann = calculate_riemann_tensor(metric, christoffel, coords)
        ricci = calculate_ricci_tensor(riemann)
        ricci_scalar = calculate_ricci_scalar(ricci, metric)
        
        return MetricResponse(
            metric_components=metric,
            event_horizon=float(outer_horizon) if outer_horizon is not None else None,
            cauchy_horizon=float(inner_horizon) if inner_horizon is not None else None,
            christoffel_symbols=christoffel,
            riemann_tensor=riemann,
            ricci_tensor=ricci,
            ricci_scalar=ricci_scalar
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        ) 