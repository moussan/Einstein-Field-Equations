import pytest
from fastapi.testclient import TestClient
import numpy as np
from unittest.mock import patch

from app.main import app
from app.core.cache import clear_cache

client = TestClient(app)

@pytest.fixture(autouse=True)
def clear_redis_cache():
    """Clear Redis cache before each test."""
    clear_cache("*")
    yield

def test_health_check():
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_cache_stats():
    """Test cache statistics endpoint."""
    response = client.get("/cache/stats")
    assert response.status_code == 200
    stats = response.json()
    assert "memory_usage" in stats
    assert "total_keys" in stats
    assert "hits" in stats
    assert "misses" in stats

class TestSchwarzschildMetric:
    """Test cases for Schwarzschild metric calculations."""
    
    def test_valid_parameters(self):
        """Test Schwarzschild metric with valid parameters."""
        data = {
            "mass": 1.0,
            "radius": 10.0,
            "theta": np.pi / 2
        }
        response = client.post("/api/v1/calculate/schwarzschild", json=data)
        assert response.status_code == 200
        result = response.json()
        
        # Check metric components
        assert "metric_components" in result
        assert "g_tt" in result["metric_components"]
        assert "g_rr" in result["metric_components"]
        assert "g_theta_theta" in result["metric_components"]
        assert "g_phi_phi" in result["metric_components"]
        
        # Check event horizon
        assert "event_horizon" in result
        assert pytest.approx(result["event_horizon"]) == 2.0  # r = 2M
        
        # Check tensor calculations
        assert "christoffel_symbols" in result
        assert "riemann_tensor" in result
        assert "ricci_tensor" in result
        assert "ricci_scalar" in result
        
        # Verify vacuum solution (Ricci tensor should be zero)
        assert all(abs(v) < 1e-10 for v in result["ricci_tensor"].values())
        assert abs(result["ricci_scalar"]) < 1e-10
    
    def test_horizon_crossing(self):
        """Test behavior near event horizon."""
        data = {
            "mass": 1.0,
            "radius": 2.1,  # Just outside horizon
            "theta": np.pi / 2
        }
        response = client.post("/api/v1/calculate/schwarzschild", json=data)
        assert response.status_code == 200
        result = response.json()
        
        # Metric should show extreme values near horizon
        assert result["metric_components"]["g_tt"] < -10
        assert result["metric_components"]["g_rr"] > 10
    
    def test_invalid_parameters(self):
        """Test with invalid parameters."""
        # Test negative mass
        data = {
            "mass": -1.0,
            "radius": 10.0,
            "theta": np.pi / 2
        }
        response = client.post("/api/v1/calculate/schwarzschild", json=data)
        assert response.status_code == 422
        
        # Test zero radius
        data["mass"] = 1.0
        data["radius"] = 0.0
        response = client.post("/api/v1/calculate/schwarzschild", json=data)
        assert response.status_code == 422
        
        # Test invalid theta
        data["radius"] = 10.0
        data["theta"] = 2 * np.pi
        response = client.post("/api/v1/calculate/schwarzschild", json=data)
        assert response.status_code == 422

class TestKerrMetric:
    """Test cases for Kerr metric calculations."""
    
    def test_valid_parameters(self):
        """Test Kerr metric with valid parameters."""
        data = {
            "mass": 1.0,
            "radius": 10.0,
            "theta": np.pi / 2,
            "angular_momentum": 0.5
        }
        response = client.post("/api/v1/calculate/kerr", json=data)
        assert response.status_code == 200
        result = response.json()
        
        # Check metric components
        assert "metric_components" in result
        assert all(key in result["metric_components"] for key in ["g_tt", "g_rr", "g_theta_theta", "g_phi_phi"])
        
        # Check horizons
        assert "event_horizon" in result
        r_plus = 1 + np.sqrt(1 - 0.25)  # M + √(M² - a²)
        assert pytest.approx(result["event_horizon"]) == r_plus
        
        # Check tensor calculations
        assert all(key in result for key in [
            "christoffel_symbols",
            "riemann_tensor",
            "ricci_tensor",
            "ricci_scalar"
        ])
        
        # Verify vacuum solution
        assert all(abs(v) < 1e-10 for v in result["ricci_tensor"].values())
        assert abs(result["ricci_scalar"]) < 1e-10
    
    def test_extremal_kerr(self):
        """Test Kerr metric at extremal rotation (a = M)."""
        data = {
            "mass": 1.0,
            "radius": 10.0,
            "theta": np.pi / 2,
            "angular_momentum": 1.0
        }
        response = client.post("/api/v1/calculate/kerr", json=data)
        assert response.status_code == 200
        result = response.json()
        
        # Check extremal horizon
        assert pytest.approx(result["event_horizon"]) == 1.0  # r = M for a = M
    
    def test_invalid_parameters(self):
        """Test with invalid parameters."""
        # Test super-extremal case (a > M)
        data = {
            "mass": 1.0,
            "radius": 10.0,
            "theta": np.pi / 2,
            "angular_momentum": 1.1
        }
        response = client.post("/api/v1/calculate/kerr", json=data)
        assert response.status_code == 400

class TestReissnerNordstromMetric:
    """Test cases for Reissner-Nordström metric calculations."""
    
    def test_valid_parameters(self):
        """Test Reissner-Nordström metric with valid parameters."""
        data = {
            "mass": 1.0,
            "radius": 10.0,
            "theta": np.pi / 2,
            "charge": 0.5
        }
        response = client.post("/api/v1/calculate/reissner-nordstrom", json=data)
        assert response.status_code == 200
        result = response.json()
        
        # Check metric components
        assert "metric_components" in result
        assert all(key in result["metric_components"] for key in ["g_tt", "g_rr", "g_theta_theta", "g_phi_phi"])
        
        # Check horizons
        r_plus = 1 + np.sqrt(1 - 0.25)  # M + √(M² - Q²)
        r_minus = 1 - np.sqrt(1 - 0.25)  # M - √(M² - Q²)
        assert pytest.approx(result["event_horizon"]) == r_plus
        assert pytest.approx(result["cauchy_horizon"]) == r_minus
        
        # Check tensor calculations
        assert all(key in result for key in [
            "christoffel_symbols",
            "riemann_tensor",
            "ricci_tensor",
            "ricci_scalar"
        ])
    
    def test_extremal_rn(self):
        """Test Reissner-Nordström metric at extremal charge (Q = M)."""
        data = {
            "mass": 1.0,
            "radius": 10.0,
            "theta": np.pi / 2,
            "charge": 1.0
        }
        response = client.post("/api/v1/calculate/reissner-nordstrom", json=data)
        assert response.status_code == 200
        result = response.json()
        
        # Check extremal horizons
        assert pytest.approx(result["event_horizon"]) == 1.0  # r = M for Q = M
        assert pytest.approx(result["cauchy_horizon"]) == 1.0  # r = M for Q = M
    
    def test_invalid_parameters(self):
        """Test with invalid parameters."""
        # Test super-extremal case (Q > M)
        data = {
            "mass": 1.0,
            "radius": 10.0,
            "theta": np.pi / 2,
            "charge": 1.1
        }
        response = client.post("/api/v1/calculate/reissner-nordstrom", json=data)
        assert response.status_code == 400

class TestCaching:
    """Test cases for API response caching."""
    
    def test_cache_hit(self):
        """Test that identical requests use cache."""
        data = {
            "mass": 1.0,
            "radius": 10.0,
            "theta": np.pi / 2
        }
        
        # First request
        response1 = client.post("/api/v1/calculate/schwarzschild", json=data)
        assert response1.status_code == 200
        
        # Second request (should hit cache)
        with patch("app.physics.tensors.calculate_christoffel_symbols") as mock_christoffel:
            response2 = client.post("/api/v1/calculate/schwarzschild", json=data)
            assert response2.status_code == 200
            mock_christoffel.assert_not_called()  # Function should not be called on cache hit
        
        # Verify responses are identical
        assert response1.json() == response2.json()
    
    def test_cache_miss(self):
        """Test that different requests don't use cache."""
        data1 = {
            "mass": 1.0,
            "radius": 10.0,
            "theta": np.pi / 2
        }
        data2 = {
            "mass": 2.0,  # Different mass
            "radius": 10.0,
            "theta": np.pi / 2
        }
        
        # First request
        response1 = client.post("/api/v1/calculate/schwarzschild", json=data1)
        assert response1.status_code == 200
        
        # Second request with different parameters (should miss cache)
        with patch("app.physics.tensors.calculate_christoffel_symbols") as mock_christoffel:
            response2 = client.post("/api/v1/calculate/schwarzschild", json=data2)
            assert response2.status_code == 200
            mock_christoffel.assert_called_once()  # Function should be called on cache miss
        
        # Verify responses are different
        assert response1.json() != response2.json() 