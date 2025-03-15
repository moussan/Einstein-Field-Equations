# Einstein Field Equations Test Suite Documentation

## Overview
This test suite provides comprehensive testing for the Einstein Field Equations project, covering frontend components, edge functions, and integration tests. The suite is designed to ensure reliability, performance, and correctness of calculations.

## Test Structure
```
tests/
├── frontend/           # Frontend component tests
│   └── unit/          # Unit tests for React components
├── edge-functions/    # Edge function tests
│   └── unit/         # Unit tests for Supabase edge functions
├── integration/      # End-to-end and API integration tests
│   └── api/         # API flow tests
└── utils/           # Test utilities and helpers
```

## Running Tests

### Prerequisites
- Node.js and npm installed
- Playwright browsers installed
- Supabase CLI installed
- Environment variables configured in `.env.test`

### Commands
```powershell
# Run all tests
./scripts/run-tests.ps1

# Run with CI configuration
./scripts/run-tests.ps1 -CI

# Run with debugging enabled
./scripts/run-tests.ps1 -Debug

# Update test snapshots
./scripts/run-tests.ps1 -UpdateSnapshots
```

## Test Categories

### 1. Frontend Component Tests
Located in `tests/frontend/unit/`
- **Auth Components**: Login form, authentication flow
- **Calculation Components**: Metric input forms, validation
- **Visualization Components**: Results display, metric visualization

### 2. Edge Function Tests
Located in `tests/edge-functions/unit/`
- **Calculation Functions**: Metric calculations, parameter validation
- **Error Handling**: Invalid inputs, missing parameters
- **Performance**: Execution time requirements

### 3. Integration Tests
Located in `tests/integration/api/`
- **End-to-End Flows**: Complete calculation workflows
- **API Integration**: Direct API endpoint testing
- **Error Scenarios**: Network issues, validation errors
- **Performance Requirements**: Response times, rate limiting

## Test Utilities

### Authentication Helpers
- `getTestSupabaseClient()`: Create Supabase client for testing
- `loginTestUser()`: Perform test user login

### Metric Calculation Helpers
- `calculateTestMetric()`: Execute metric calculations
- `generateTestMetricData()`: Generate test parameters
- `expectMetricComponents()`: Validate metric results

### Performance Testing
- `measurePerformance()`: Track and validate execution times
- Performance thresholds defined in `.env.test`

### Network Simulation
- `simulateNetworkConditions()`: Test different network states
- Supports offline, slow, and fast network conditions

### Error Testing
- `simulateError()`: Simulate various error conditions
- Network errors, validation errors, server errors

### Screenshot Capture
- `captureScreenshot()`: Capture test execution states
- Automatic timestamp and naming

## Configuration

### Environment Variables
Configure test environment in `.env.test`:
- API endpoints and keys
- Test user credentials
- Performance thresholds
- Feature flags

### Playwright Configuration
Configure browser testing in `playwright.config.ts`:
- Browser configurations
- Timeout settings
- Parallel execution
- Reporter settings

## Best Practices

### Writing Tests
1. Use descriptive test names
2. Follow the Arrange-Act-Assert pattern
3. Isolate tests using beforeEach/afterEach
4. Clean up test data after execution
5. Use test utilities for common operations

### Test Data Management
1. Use `generateTestMetricData()` for consistent test data
2. Clean up test data using `cleanupTestData()`
3. Avoid hardcoding test values

### Error Handling
1. Test both success and error paths
2. Use `simulateError()` for error scenarios
3. Validate error messages and states

### Performance Testing
1. Use `measurePerformance()` for timing
2. Compare against thresholds in `.env.test`
3. Consider CI environment variations

## Continuous Integration

### GitHub Actions Integration
- Automatic test execution on pull requests
- Performance baseline enforcement
- Test report generation
- Screenshot and video capture on failure

### Test Reports
- HTML reports generated for local runs
- GitHub reporter for CI environment
- Screenshots and videos saved for failed tests

## Troubleshooting

### Common Issues
1. **Test Timeouts**
   - Check network conditions
   - Verify performance thresholds
   - Review browser configuration

2. **Authentication Failures**
   - Verify test user credentials
   - Check Supabase connection
   - Review token expiration

3. **Flaky Tests**
   - Use retry mechanisms
   - Add additional waits
   - Review race conditions

### Debug Mode
Enable debug mode for detailed logging:
```powershell
./scripts/run-tests.ps1 -Debug
```

## Contributing

### Adding New Tests
1. Follow existing test patterns
2. Use test utilities
3. Update documentation
4. Verify CI pipeline

### Updating Test Utilities
1. Add new helpers to `test-helpers.ts`
2. Document new utilities
3. Update example usage
4. Run existing tests

## Maintenance

### Regular Tasks
1. Update test data
2. Review performance thresholds
3. Update browser configurations
4. Clean up test artifacts

### Version Updates
1. Update dependencies
2. Review browser compatibility
3. Update test utilities
4. Verify existing tests
