# Testing Guide

This guide explains how to run and write tests for the Einstein Field Equations calculator.

## Setup

1. Install dependencies:
```bash
pip install -r requirements-dev.txt
```

2. Start Redis server:
```bash
redis-server
```

## Running Tests

To run all tests:
```bash
pytest
```

To run specific test files:
```bash
pytest tests/test_api.py
pytest tests/test_tensors.py
```

To run tests with coverage:
```bash
pytest --cov=app tests/
```

## Test Structure

The test suite is organized as follows:

- `tests/conftest.py`: Contains test fixtures and configuration
- `tests/test_api.py`: Tests for API endpoints
- `tests/test_tensors.py`: Tests for tensor calculations
- `tests/utils/`: Helper functions for testing

## Authentication in Tests

Tests use a session-based authentication system. The `mock_session` fixture in `conftest.py` provides a mock user session for testing authenticated endpoints.

Example usage:
```python
def test_authenticated_endpoint(test_app, mock_session):
    # Test code here
```

## Cache Testing

Redis is used for caching API responses. The test suite includes fixtures for Redis client management and cache cleanup.

Example cache test:
```python
def test_cache_behavior(test_app, redis_client):
    # Test code here
```

## Writing Tests

1. Use appropriate fixtures from `conftest.py`
2. Follow the existing test structure
3. Include both positive and negative test cases
4. Test edge cases and boundary conditions
5. Use descriptive test names

Example test:
```python
def test_schwarzschild_metric_valid_parameters(test_app):
    response = test_app.post("/metrics/schwarzschild", 
                            json={"mass": 1.0, "r": 10.0})
    assert response.status_code == 200
    # Additional assertions
```

## Test Categories

1. API Tests:
   - Endpoint availability
   - Input validation
   - Response structure
   - Error handling

2. Physics Tests:
   - Metric calculations
   - Tensor operations
   - Physical constraints
   - Edge cases

3. Cache Tests:
   - Cache hits/misses
   - Cache invalidation
   - Performance impact

## Continuous Integration

Tests are run automatically on:
- Pull requests
- Merges to main branch
- Daily scheduled runs

## Troubleshooting

Common issues and solutions:

1. Redis connection errors:
   - Ensure Redis server is running
   - Check Redis connection settings

2. Test failures:
   - Check test dependencies
   - Verify test data
   - Review error messages

## Contributing

When adding new tests:

1. Follow the existing pattern
2. Add appropriate fixtures
3. Include documentation
4. Test edge cases
5. Verify cache behavior
