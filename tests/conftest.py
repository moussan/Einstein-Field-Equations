import pytest
from fastapi.testclient import TestClient
from typing import Generator
import redis

from app.main import app

@pytest.fixture
def test_app() -> Generator:
    client = TestClient(app)
    yield client

@pytest.fixture
def redis_client() -> Generator:
    client = redis.Redis(host='localhost', port=6379, db=1)
    yield client
    client.flushdb()
    client.close()

@pytest.fixture(autouse=True)
def cleanup_cache(redis_client: redis.Redis) -> None:
    redis_client.flushdb()

@pytest.fixture
def mock_session() -> dict:
    return {
        'access_token': 'mock-token',
        'user': {
            'id': 'mock-user-id',
            'email': 'test@example.com',
            'created_at': '2024-01-01T00:00:00Z'
        }
    }

@pytest.fixture
def schwarzschild_test_data() -> dict:
    return {
        'mass': 1.0,
        'r': 10.0
    }

@pytest.fixture
def kerr_test_data() -> dict:
    return {
        'mass': 1.0,
        'a': 0.5,
        'r': 10.0,
        'theta': 1.5708
    }

@pytest.fixture
def reissner_nordstrom_test_data() -> dict:
    return {
        'mass': 1.0,
        'charge': 0.5,
        'r': 10.0
    } 