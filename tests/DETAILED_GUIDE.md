# Detailed Testing Guide

## Introduction

This guide provides detailed information about the testing infrastructure for the Einstein Field Equations calculator. The test suite is designed to ensure the correctness of physical calculations, API functionality, and caching behavior.

## Test Architecture

### Directory Structure

```
tests/
├── conftest.py           # Test configuration and fixtures
├── test_api.py          # API endpoint tests
├── test_tensors.py      # Physics calculations tests
├── utils/               # Test utilities
│   └── test_helpers.ts  # Helper functions
├── README.md            # Quick start guide
├── QUICK_REFERENCE.md   # Common patterns and examples
└── DETAILED_GUIDE.md    # This file
```

### Key Components

1. **Test Client**: FastAPI TestClient for API testing
2. **Redis Client**: Redis connection for cache testing
3. **Mock Session**: Session-based authentication for protected endpoints
4. **Test Fixtures**: Reusable test setup and data

## Test Categories

### 1. API Tests

API tests verify the functionality of HTTP endpoints:

```python
def test_metric_calculation(test_app: TestClient):
    response = test_app.post(
        "/metrics/schwarzschild",
        json={"mass": 1.0, "r": 10.0}
    )
    assert response.status_code == 200
    data = response.json()
    assert_valid_metric_response(data)
```

### 2. Physics Tests

Physics tests verify the correctness of tensor calculations:

```python
def test_riemann_tensor_symmetry():
    # Test first Bianchi identity
    R_abcd = calculate_riemann_tensor(metric)
    for i in range(4):
        for j in range(4):
            for k in range(4):
                for l in range(4):
                    # R_abcd + R_bcad + R_cabd = 0
                    sum_cyclic = (
                        R_abcd[i][j][k][l] +
                        R_abcd[j][k][i][l] +
                        R_abcd[k][i][j][l]
                    )
                    assert abs(sum_cyclic) < 1e-10
```

### 3. Cache Tests

Cache tests verify Redis caching behavior:

```python
def test_cache_functionality(test_app: TestClient, redis_client: redis.Redis):
    # First request
    response1 = test_app.post(
        "/metrics/schwarzschild",
        json={"mass": 1.0, "r": 10.0}
    )
    
    # Verify cache entry
    cache_key = generate_cache_key("schwarzschild", {"mass": 1.0, "r": 10.0})
    assert redis_client.exists(cache_key)
    
    # Second request (should hit cache)
    response2 = test_app.post(
        "/metrics/schwarzschild",
        json={"mass": 1.0, "r": 10.0}
    )
    
    # Verify responses match
    assert response1.json() == response2.json()
```

## Authentication

The test suite uses session-based authentication:

```python
def test_protected_endpoint(test_app: TestClient, mock_session: dict):
    # Set session
    test_app.cookies["user_session"] = json.dumps(mock_session)
    
    # Test protected endpoint
    response = test_app.get("/protected-route")
    assert response.status_code == 200
```

## Caching System

Redis is used for caching API responses:

```python
def test_cache_stats(test_app: TestClient, redis_client: redis.Redis):
    # Make some requests
    test_app.post("/metrics/schwarzschild", json={"mass": 1.0, "r": 10.0})
    test_app.post("/metrics/schwarzschild", json={"mass": 1.0, "r": 10.0})
    
    # Check cache statistics
    stats = test_app.get("/cache/stats").json()
    assert stats["hits"] == 1
    assert stats["misses"] == 1
```

## Test Fixtures

### Common Fixtures

```python
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

@pytest.fixture
def mock_session() -> dict:
    return {
        "access_token": "mock-token",
        "user": {
            "id": "mock-user-id",
            "email": "test@example.com"
        }
    }
```

### Physics Test Data

```python
@pytest.fixture
def schwarzschild_test_data() -> dict:
    return {
        "mass": 1.0,
        "r": 10.0
    }

@pytest.fixture
def kerr_test_data() -> dict:
    return {
        "mass": 1.0,
        "a": 0.5,
        "r": 10.0,
        "theta": 1.5708
    }
```

## Test Utilities

### Response Validation

```python
def assert_valid_metric_response(data: dict):
    required_fields = [
        "metric_components",
        "christoffel_symbols",
        "riemann_tensor",
        "ricci_tensor",
        "ricci_scalar"
    ]
    for field in required_fields:
        assert field in data
```

### Cache Utilities

```python
def generate_cache_key(metric_type: str, params: dict) -> str:
    param_str = json.dumps(params, sort_keys=True)
    return f"metric:{metric_type}:{param_str}"
```

## Best Practices

### 1. Test Organization

- Group related tests in classes
- Use descriptive test names
- Follow the Arrange-Act-Assert pattern

### 2. Test Data

- Use fixtures for common data
- Avoid hardcoded values
- Test edge cases and boundaries

### 3. Cache Testing

- Clear cache before tests
- Verify cache hits and misses
- Test cache invalidation

### 4. Error Handling

- Test error conditions
- Verify error messages
- Check status codes

### 5. Physics Validation

- Test physical constraints
- Verify tensor symmetries
- Check conservation laws

## Continuous Integration

Tests are run automatically on:
- Pull requests
- Merges to main branch
- Daily scheduled runs

## Troubleshooting

### Common Issues

1. Redis Connection:
```python
# Check Redis connection
try:
    redis_client.ping()
except redis.ConnectionError:
    print("Redis server not running")
```

2. Test Failures:
```python
# Enable verbose output
pytest -v --tb=short

# Debug specific test
pytest tests/test_api.py::test_name -vv
```

## Contributing

When adding new tests:

1. Follow existing patterns
2. Add appropriate fixtures
3. Document test requirements
4. Include edge cases
5. Test cache behavior
6. Verify error handling

## Performance Considerations

1. Cache Testing:
- Use appropriate TTL values
- Monitor memory usage
- Test concurrent access

2. API Testing:
- Set reasonable timeouts
- Test rate limiting
- Monitor response times

## Security Testing

1. Authentication:
- Test token validation
- Verify session handling
- Check authorization

2. Input Validation:
- Test parameter bounds
- Check input sanitization
- Verify error handling 