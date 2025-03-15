import pytest
from fastapi.testclient import TestClient
import numpy as np
from unittest.mock import patch

def test_health_check(test_app: TestClient):
    response = test_app.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_cache_stats(test_app: TestClient):
    response = test_app.get("/cache/stats")
    assert response.status_code == 200
    data = response.json()
    assert "memory_usage" in data
    assert "total_keys" in data
    assert "hits" in data
    assert "misses" in data

class TestSchwarzschildMetric:
    def test_valid_parameters(self, test_app: TestClient, schwarzschild_test_data: dict):
        response = test_app.post("/metrics/schwarzschild", json=schwarzschild_test_data)
        assert response.status_code == 200
        data = response.json()
        assert "metric_components" in data
        assert "christoffel_symbols" in data
        assert "riemann_tensor" in data
        assert "ricci_tensor" in data
        assert "ricci_scalar" in data
        assert "event_horizon" in data

    def test_near_event_horizon(self, test_app: TestClient):
        data = {"mass": 1.0, "r": 2.1}  # Just outside event horizon
        response = test_app.post("/metrics/schwarzschild", json=data)
        assert response.status_code == 200
        result = response.json()
        assert abs(result["event_horizon"] - 2.0) < 1e-10

    def test_invalid_parameters(self, test_app: TestClient):
        data = {"mass": -1.0, "r": 1.0}  # Negative mass
        response = test_app.post("/metrics/schwarzschild", json=data)
        assert response.status_code == 400

class TestKerrMetric:
    def test_valid_parameters(self, test_app: TestClient, kerr_test_data: dict):
        response = test_app.post("/metrics/kerr", json=kerr_test_data)
        assert response.status_code == 200
        data = response.json()
        assert "metric_components" in data
        assert "christoffel_symbols" in data
        assert "riemann_tensor" in data
        assert "ricci_tensor" in data
        assert "ricci_scalar" in data
        assert "event_horizons" in data

    def test_extremal_kerr(self, test_app: TestClient):
        data = {"mass": 1.0, "a": 1.0, "r": 5.0, "theta": np.pi/2}
        response = test_app.post("/metrics/kerr", json=data)
        assert response.status_code == 200
        result = response.json()
        horizons = result["event_horizons"]
        assert len(horizons) == 2
        assert abs(horizons[0] - horizons[1]) < 1e-10  # Horizons coincide

    def test_invalid_parameters(self, test_app: TestClient):
        data = {"mass": 1.0, "a": 1.5, "r": 5.0, "theta": np.pi/2}  # a > M
        response = test_app.post("/metrics/kerr", json=data)
        assert response.status_code == 400

class TestReissnerNordstromMetric:
    def test_valid_parameters(self, test_app: TestClient, reissner_nordstrom_test_data: dict):
        response = test_app.post("/metrics/reissner-nordstrom", json=reissner_nordstrom_test_data)
        assert response.status_code == 200
        data = response.json()
        assert "metric_components" in data
        assert "christoffel_symbols" in data
        assert "riemann_tensor" in data
        assert "ricci_tensor" in data
        assert "ricci_scalar" in data
        assert "event_horizons" in data

    def test_extremal_charge(self, test_app: TestClient):
        data = {"mass": 1.0, "charge": 1.0, "r": 5.0}
        response = test_app.post("/metrics/reissner-nordstrom", json=data)
        assert response.status_code == 200
        result = response.json()
        horizons = result["event_horizons"]
        assert len(horizons) == 2
        assert abs(horizons[0] - horizons[1]) < 1e-10  # Horizons coincide

    def test_invalid_parameters(self, test_app: TestClient):
        data = {"mass": 1.0, "charge": 1.5, "r": 5.0}  # Q > M
        response = test_app.post("/metrics/reissner-nordstrom", json=data)
        assert response.status_code == 400

class TestCaching:
    def test_cache_hit(self, test_app: TestClient, schwarzschild_test_data: dict):
        # First request
        response1 = test_app.post("/metrics/schwarzschild", json=schwarzschild_test_data)
        assert response1.status_code == 200

        # Second request with same parameters
        response2 = test_app.post("/metrics/schwarzschild", json=schwarzschild_test_data)
        assert response2.status_code == 200

        # Check cache stats
        stats_response = test_app.get("/cache/stats")
        stats = stats_response.json()
        assert stats["hits"] > 0

    def test_cache_miss(self, test_app: TestClient):
        data1 = {"mass": 1.0, "r": 10.0}
        data2 = {"mass": 2.0, "r": 10.0}

        # First request
        response1 = test_app.post("/metrics/schwarzschild", json=data1)
        assert response1.status_code == 200

        # Second request with different parameters
        response2 = test_app.post("/metrics/schwarzschild", json=data2)
        assert response2.status_code == 200

        # Check cache stats
        stats_response = test_app.get("/cache/stats")
        stats = stats_response.json()
        assert stats["misses"] > 0 