import pytest
import numpy as np
from app.physics.tensors import (
    calculate_christoffel_symbols,
    calculate_riemann_tensor,
    calculate_ricci_tensor,
    calculate_ricci_scalar
)

class TestTensorCalculations:
    """Test cases for tensor calculations."""
    
    def test_schwarzschild_christoffel_symbols(self):
        """Test Christoffel symbols for Schwarzschild metric."""
        # Set up Schwarzschild metric at r = 10M, θ = π/2
        mass = 1.0
        radius = 10.0
        rs = 2 * mass
        
        metric = {
            "g_tt": -(1 - rs/radius),
            "g_rr": 1/(1 - rs/radius),
            "g_theta_theta": radius**2,
            "g_phi_phi": radius**2 * np.sin(np.pi/2)**2
        }
        
        coords = {
            "mass": mass,
            "radius": radius,
            "theta": np.pi/2,
            "metric_type": "schwarzschild"
        }
        
        christoffel = calculate_christoffel_symbols(metric, coords)
        
        # Test key non-zero components
        assert np.abs(christoffel["Gamma_t_t_r"] - mass/(radius**2 * (1 - 2*mass/radius))) < 1e-10
        assert np.abs(christoffel["Gamma_r_t_t"] - mass*(1 - 2*mass/radius)/(radius**2)) < 1e-10
        assert np.abs(christoffel["Gamma_r_r_r"] + mass/(radius**2 * (1 - 2*mass/radius))) < 1e-10
        assert np.abs(christoffel["Gamma_theta_r_theta"] - 1/radius) < 1e-10
        assert np.abs(christoffel["Gamma_phi_r_phi"] - 1/radius) < 1e-10
    
    def test_kerr_christoffel_symbols(self):
        """Test Christoffel symbols for Kerr metric."""
        # Set up Kerr metric at r = 10M, θ = π/2, a = 0.5M
        mass = 1.0
        radius = 10.0
        a = 0.5
        
        # Simplified Kerr metric components at θ = π/2
        rho2 = radius**2 + a**2 * np.cos(np.pi/2)**2
        delta = radius**2 - 2*mass*radius + a**2
        
        metric = {
            "g_tt": -(1 - 2*mass*radius/rho2),
            "g_rr": rho2/delta,
            "g_theta_theta": rho2,
            "g_phi_phi": (radius**2 + a**2 + 2*mass*radius*a**2/rho2) * np.sin(np.pi/2)**2
        }
        
        coords = {
            "mass": mass,
            "radius": radius,
            "theta": np.pi/2,
            "angular_momentum": a,
            "metric_type": "kerr"
        }
        
        christoffel = calculate_christoffel_symbols(metric, coords)
        
        # Verify that we get non-zero components
        assert len(christoffel) > 0
        # Verify symmetry in lower indices
        for key in christoffel:
            if key.startswith("Gamma_") and "_t_r" in key:
                reversed_key = key.replace("_t_r", "_r_t")
                assert np.abs(christoffel[key] - christoffel[reversed_key]) < 1e-10
    
    def test_riemann_tensor_symmetries(self):
        """Test symmetry properties of the Riemann tensor."""
        # Use Schwarzschild metric for simplicity
        mass = 1.0
        radius = 10.0
        rs = 2 * mass
        
        metric = {
            "g_tt": -(1 - rs/radius),
            "g_rr": 1/(1 - rs/radius),
            "g_theta_theta": radius**2,
            "g_phi_phi": radius**2 * np.sin(np.pi/2)**2
        }
        
        coords = {
            "mass": mass,
            "radius": radius,
            "theta": np.pi/2,
            "metric_type": "schwarzschild"
        }
        
        christoffel = calculate_christoffel_symbols(metric, coords)
        riemann = calculate_riemann_tensor(metric, christoffel, coords)
        
        # Test antisymmetry in first two indices
        for key in riemann:
            if "_t_r_" in key:
                reversed_key = key.replace("_t_r_", "_r_t_")
                assert np.abs(riemann[key] + riemann[reversed_key]) < 1e-10
    
    def test_ricci_tensor_symmetry(self):
        """Test symmetry of the Ricci tensor."""
        # Use Schwarzschild metric
        mass = 1.0
        radius = 10.0
        rs = 2 * mass
        
        metric = {
            "g_tt": -(1 - rs/radius),
            "g_rr": 1/(1 - rs/radius),
            "g_theta_theta": radius**2,
            "g_phi_phi": radius**2 * np.sin(np.pi/2)**2
        }
        
        coords = {
            "mass": mass,
            "radius": radius,
            "theta": np.pi/2,
            "metric_type": "schwarzschild"
        }
        
        christoffel = calculate_christoffel_symbols(metric, coords)
        riemann = calculate_riemann_tensor(metric, christoffel, coords)
        ricci = calculate_ricci_tensor(riemann)
        
        # Test symmetry R_μν = R_νμ
        for key in ricci:
            if "_t_r" in key:
                reversed_key = key.replace("_t_r", "_r_t")
                assert np.abs(ricci[key] - ricci[reversed_key]) < 1e-10
    
    def test_vacuum_solution(self):
        """Test that vacuum solutions have vanishing Ricci tensor."""
        # Test for Schwarzschild metric (known vacuum solution)
        mass = 1.0
        radius = 10.0
        rs = 2 * mass
        
        metric = {
            "g_tt": -(1 - rs/radius),
            "g_rr": 1/(1 - rs/radius),
            "g_theta_theta": radius**2,
            "g_phi_phi": radius**2 * np.sin(np.pi/2)**2
        }
        
        coords = {
            "mass": mass,
            "radius": radius,
            "theta": np.pi/2,
            "metric_type": "schwarzschild"
        }
        
        christoffel = calculate_christoffel_symbols(metric, coords)
        riemann = calculate_riemann_tensor(metric, christoffel, coords)
        ricci = calculate_ricci_tensor(riemann)
        ricci_scalar = calculate_ricci_scalar(ricci, metric)
        
        # Check that all components are effectively zero
        assert all(abs(v) < 1e-10 for v in ricci.values())
        assert abs(ricci_scalar) < 1e-10
    
    def test_coordinate_transformation(self):
        """Test tensor transformation properties under coordinate scaling."""
        # Test scaling of radial coordinate in Schwarzschild metric
        mass = 1.0
        radius = 10.0
        scale = 2.0  # Scale factor for coordinates
        rs = 2 * mass
        
        # Original metric
        metric1 = {
            "g_tt": -(1 - rs/radius),
            "g_rr": 1/(1 - rs/radius),
            "g_theta_theta": radius**2,
            "g_phi_phi": radius**2 * np.sin(np.pi/2)**2
        }
        
        # Scaled metric
        metric2 = {
            "g_tt": -(1 - rs/(scale*radius)),
            "g_rr": 1/(1 - rs/(scale*radius)),
            "g_theta_theta": (scale*radius)**2,
            "g_phi_phi": (scale*radius)**2 * np.sin(np.pi/2)**2
        }
        
        coords1 = {
            "mass": mass,
            "radius": radius,
            "theta": np.pi/2,
            "metric_type": "schwarzschild"
        }
        
        coords2 = {
            "mass": mass,
            "radius": scale*radius,
            "theta": np.pi/2,
            "metric_type": "schwarzschild"
        }
        
        # Calculate Riemann tensors for both metrics
        christoffel1 = calculate_christoffel_symbols(metric1, coords1)
        riemann1 = calculate_riemann_tensor(metric1, christoffel1, coords1)
        
        christoffel2 = calculate_christoffel_symbols(metric2, coords2)
        riemann2 = calculate_riemann_tensor(metric2, christoffel2, coords2)
        
        # Compare scaled components
        # The Riemann tensor components should transform according to the scaling
        for key in riemann1:
            if "_r_" in key:
                # Components with one radial index should scale as 1/scale
                assert np.abs(riemann1[key] - scale * riemann2[key]) < 1e-10
            elif "_r_" in key.count("_r_") == 2:
                # Components with two radial indices should scale as 1/scale^2
                assert np.abs(riemann1[key] - scale**2 * riemann2[key]) < 1e-10 