import pytest
import redis
from typing import Generator
from fastapi.testclient import TestClient

from app.main import app
from app.core.cache import clear_cache

@pytest.fixture(scope="session")
def redis_client() -> Generator[redis.Redis, None, None]:
    """Create a Redis client for testing."""
    client = redis.Redis(
        host="localhost",
        port=6379,
        db=1,  # Use a different database for testing
        decode_responses=True
    )
    try:
        yield client
    finally:
        # Clear test database
        client.flushdb()
        client.close()

@pytest.fixture(scope="session")
def test_app() -> Generator[TestClient, None, None]:
    """Create a FastAPI TestClient."""
    with TestClient(app) as client:
        yield client

@pytest.fixture(autouse=True)
def cleanup_cache() -> Generator[None, None, None]:
    """Clear Redis cache before and after each test."""
    clear_cache("*")
    yield
    clear_cache("*")

@pytest.fixture
def schwarzschild_test_data() -> dict:
    """Return test data for Schwarzschild metric."""
    return {
        "mass": 1.0,
        "radius": 10.0,
        "theta": 1.5707963267948966  # π/2
    }

@pytest.fixture
def kerr_test_data() -> dict:
    """Return test data for Kerr metric."""
    return {
        "mass": 1.0,
        "radius": 10.0,
        "theta": 1.5707963267948966,  # π/2
        "angular_momentum": 0.5
    }

@pytest.fixture
def reissner_nordstrom_test_data() -> dict:
    """Return test data for Reissner-Nordström metric."""
    return {
        "mass": 1.0,
        "radius": 10.0,
        "theta": 1.5707963267948966,  # π/2
        "charge": 0.5
    } 