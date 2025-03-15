import pytest
from fastapi.testclient import TestClient
import numpy as np
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

class TestSchwarzschildMetric:
    def test_valid_parameters(self):
        response = client.post(
            "/api/v1/calculate/schwarzschild",
            json={"mass": 1.0, "radius": 10.0, "theta": np.pi/2}
        )
        assert response.status_code == 200
        data = response.json()
        assert "metric_components" in data
        assert "event_horizon" in data
        assert data["event_horizon"] == 2.0  # rs = 2M for M = 1
        
        # Test metric signature
        g = data["metric_components"]
        assert g["g_tt"] < 0  # Timelike signature
        assert g["g_rr"] > 0  # Spacelike signature
        assert g["g_theta_theta"] > 0
        assert g["g_phi_phi"] > 0
    
    def test_invalid_mass(self):
        response = client.post(
            "/api/v1/calculate/schwarzschild",
            json={"mass": -1.0, "radius": 10.0, "theta": np.pi/2}
        )
        assert response.status_code == 422  # Validation error
    
    def test_invalid_radius(self):
        response = client.post(
            "/api/v1/calculate/schwarzschild",
            json={"mass": 1.0, "radius": 0.0, "theta": np.pi/2}
        )
        assert response.status_code == 422  # Validation error

class TestKerrMetric:
    def test_valid_parameters(self):
        response = client.post(
            "/api/v1/calculate/kerr",
            json={
                "mass": 1.0,
                "angular_momentum": 0.5,
                "radius": 10.0,
                "theta": np.pi/2
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "metric_components" in data
        assert "event_horizon" in data
        
        # Test metric signature
        g = data["metric_components"]
        assert g["g_tt"] < 0  # Timelike signature
        assert g["g_rr"] > 0  # Spacelike signature
        assert g["g_theta_theta"] > 0
        assert g["g_phi_phi"] > 0
    
    def test_extremal_kerr(self):
        """Test a = M case (extremal Kerr black hole)"""
        response = client.post(
            "/api/v1/calculate/kerr",
            json={
                "mass": 1.0,
                "angular_momentum": 1.0,
                "radius": 10.0,
                "theta": np.pi/2
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["event_horizon"] == 1.0  # r+ = M for a = M
    
    def test_invalid_angular_momentum(self):
        """Test a > M case (naked singularity)"""
        response = client.post(
            "/api/v1/calculate/kerr",
            json={
                "mass": 1.0,
                "angular_momentum": 1.1,
                "radius": 10.0,
                "theta": np.pi/2
            }
        )
        assert response.status_code == 400

class TestReissnerNordstromMetric:
    def test_valid_parameters(self):
        response = client.post(
            "/api/v1/calculate/reissner-nordstrom",
            json={
                "mass": 1.0,
                "charge": 0.5,
                "radius": 10.0,
                "theta": np.pi/2
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "metric_components" in data
        assert "event_horizon" in data
        assert "cauchy_horizon" in data
        
        # Test metric signature
        g = data["metric_components"]
        assert g["g_tt"] < 0  # Timelike signature
        assert g["g_rr"] > 0  # Spacelike signature
        assert g["g_theta_theta"] > 0
        assert g["g_phi_phi"] > 0
        
        # Test horizons
        assert data["event_horizon"] > data["cauchy_horizon"]
    
    def test_extremal_reissner_nordstrom(self):
        """Test Q = M case (extremal Reissner-Nordström black hole)"""
        response = client.post(
            "/api/v1/calculate/reissner-nordstrom",
            json={
                "mass": 1.0,
                "charge": 1.0,
                "radius": 10.0,
                "theta": np.pi/2
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["event_horizon"] == data["cauchy_horizon"] == 1.0  # r+ = r- = M for Q = M
    
    def test_invalid_charge(self):
        """Test Q > M case (naked singularity)"""
        response = client.post(
            "/api/v1/calculate/reissner-nordstrom",
            json={
                "mass": 1.0,
                "charge": 1.1,
                "radius": 10.0,
                "theta": np.pi/2
            }
        )
        assert response.status_code == 400

def test_asymptotic_flatness():
    """Test that all metrics approach Minkowski at large distances"""
    r = 1e6  # Large radius
    mass = 1.0
    
    # Schwarzschild
    response = client.post(
        "/api/v1/calculate/schwarzschild",
        json={"mass": mass, "radius": r, "theta": np.pi/2}
    )
    g_schw = response.json()["metric_components"]
    assert abs(g_schw["g_tt"] + 1) < 1e-5
    assert abs(g_schw["g_rr"] - 1) < 1e-5
    
    # Kerr
    response = client.post(
        "/api/v1/calculate/kerr",
        json={"mass": mass, "angular_momentum": 0.5, "radius": r, "theta": np.pi/2}
    )
    g_kerr = response.json()["metric_components"]
    assert abs(g_kerr["g_tt"] + 1) < 1e-5
    assert abs(g_kerr["g_rr"] - 1) < 1e-5
    
    # Reissner-Nordström
    response = client.post(
        "/api/v1/calculate/reissner-nordstrom",
        json={"mass": mass, "charge": 0.5, "radius": r, "theta": np.pi/2}
    )
    g_rn = response.json()["metric_components"]
    assert abs(g_rn["g_tt"] + 1) < 1e-5
    assert abs(g_rn["g_rr"] - 1) < 1e-5 