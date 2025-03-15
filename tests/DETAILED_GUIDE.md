# Einstein Field Equations Testing Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Test Architecture](#test-architecture)
3. [Writing Tests](#writing-tests)
4. [Test Utilities in Detail](#test-utilities-in-detail)
5. [Advanced Testing Patterns](#advanced-testing-patterns)
6. [Debugging and Troubleshooting](#debugging-and-troubleshooting)
7. [CI/CD Integration](#cicd-integration)

## Getting Started

### Initial Setup
```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Setup test environment
cp .env.example .env.test
```

### Environment Configuration
```env
# Required environment variables for testing
BASE_URL=http://localhost:3000
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-test-anon-key

# Test user configuration
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=secure-password
TEST_USER_ID=test-user-id

# Performance thresholds (milliseconds)
MAX_CALCULATION_TIME=2000
MAX_API_RESPONSE_TIME=1000
MAX_PAGE_LOAD_TIME=3000
```

## Test Architecture

### Directory Structure Explained
```
tests/
├── frontend/           # Frontend component tests
│   ├── unit/          # Unit tests for React components
│   │   ├── auth/      # Authentication component tests
│   │   ├── calc/      # Calculation component tests
│   │   └── viz/       # Visualization component tests
│   └── integration/   # Component integration tests
├── edge-functions/    # Edge function tests
│   ├── unit/         # Individual function tests
│   └── integration/  # Function integration tests
├── integration/      # End-to-end tests
│   ├── api/         # API flow tests
│   └── e2e/        # Full user journey tests
├── utils/           # Test utilities
│   ├── helpers/    # Helper functions
│   └── fixtures/   # Test fixtures
└── examples/       # Example tests
```

### Test Categories in Detail

#### Frontend Tests
- **Component Tests**: Verify individual React components
- **Integration Tests**: Test component interactions
- **Visual Tests**: Check component rendering
- **State Management**: Verify state updates

Example component test:
```typescript
test('login form validation', async ({ page }) => {
  await loginTestUser(page);
  
  // Test empty fields
  await page.click('[data-testid="login-button"]');
  expect(await page.textContent('[data-testid="error-message"]'))
    .toContain('required');
    
  // Test invalid email
  await page.fill('[data-testid="email-input"]', 'invalid');
  expect(await page.textContent('[data-testid="error-message"]'))
    .toContain('valid email');
});
```

#### Edge Function Tests
- **Unit Tests**: Individual function behavior
- **Integration Tests**: Function interactions
- **Performance Tests**: Execution time verification
- **Error Handling**: Error case validation

Example edge function test:
```typescript
test('calculate schwarzschild metric', async () => {
  const result = await calculateTestMetric(page, 'schwarzschild', {
    mass: 1.0
  });
  
  expect(result.components).toMatchObject({
    g00: '-1',
    g11: '1/(1-2M/r)'
  });
});
```

## Writing Tests

### Test Structure Best Practices

1. **Arrange-Act-Assert Pattern**
```typescript
test('metric calculation', async ({ page }) => {
  // Arrange
  const metricData = generateTestMetricData('schwarzschild');
  await loginTestUser(page);
  
  // Act
  await calculateTestMetric(page, 'schwarzschild', metricData);
  
  // Assert
  const results = await page.textContent('[data-testid="results-container"]');
  expect(results).toBeTruthy();
});
```

2. **Test Isolation**
```typescript
test.describe('isolated tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginTestUser(page);
    await cleanupTestData(supabase);
  });

  test.afterEach(async () => {
    await cleanupTestData(supabase);
  });

  // Test cases...
});
```

3. **Error Testing**
```typescript
test('handles network errors', async ({ page }) => {
  await simulateError(page, 'network');
  await expectErrorMessage(page, 'network');
  await verifyRecoveryBehavior(page);
});
```

## Test Utilities in Detail

### Authentication Utilities
```typescript
// Login with custom credentials
await loginTestUser(page, {
  email: 'custom@example.com',
  password: 'custom-password'
});

// Verify authentication state
const isAuthenticated = await checkAuthState(page);
```

### Metric Calculation Utilities
```typescript
// Generate custom metric data
const customData = generateTestMetricData('custom', {
  mass: 2.0,
  charge: 0.5
});

// Calculate with validation
await calculateTestMetric(page, 'custom', customData, {
  validateResults: true,
  timeout: 5000
});
```

### Performance Testing Utilities
```typescript
// Measure with custom thresholds
const result = await measurePerformance(
  async () => {
    await heavyOperation();
  },
  {
    maxDuration: 1000,
    allowedDeviation: 100
  }
);

// Performance profiling
const profile = await startPerformanceProfile(page);
await executeOperations();
const metrics = await profile.stop();
```

## Advanced Testing Patterns

### Parallel Testing
```typescript
test.describe.parallel('parallel tests', () => {
  test('test1', async ({ page }) => {
    // Test case 1
  });

  test('test2', async ({ page }) => {
    // Test case 2
  });
});
```

### Visual Regression Testing
```typescript
test('visual comparison', async ({ page }) => {
  await page.goto('/calculate');
  await expect(page).toHaveScreenshot('calculation-form.png');
});
```

### API Mocking
```typescript
test('mocked API response', async ({ page }) => {
  await page.route('**/api/calculate', route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify(mockResponse)
    });
  });
});
```

## Debugging and Troubleshooting

### Common Issues and Solutions

1. **Test Timeouts**
```typescript
// Increase timeout for slow operations
test.setTimeout(120000);

// Add explicit waits
await page.waitForSelector('[data-testid="results"]', {
  timeout: 10000,
  state: 'visible'
});
```

2. **Network Issues**
```typescript
// Retry flaky network requests
test.retry(3);

// Handle network errors
try {
  await makeRequest();
} catch (error) {
  console.log('Network error:', error);
  await retryWithBackoff();
}
```

### Debugging Tools

1. **Visual Debugging**
```typescript
// Launch browser in debug mode
npx playwright test --debug

// Take screenshots at key points
await captureScreenshot(page, 'debug-state');
```

2. **Console Logging**
```typescript
// Enable verbose logging
test.use({ logger: console });

// Log important state changes
console.log('Test state:', await getTestState());
```

## CI/CD Integration

### GitHub Actions Configuration
```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
      - name: Upload results
        uses: actions/upload-artifact@v2
        with:
          name: test-results
          path: test-results/
```

### Test Reports
```typescript
// Generate custom test report
const report = await generateTestReport({
  includeScreenshots: true,
  includeLogs: true,
  format: 'html'
});

// Save report artifacts
await saveTestArtifacts(report, 'test-results');
```

## Contributing

### Adding New Tests
1. Create test file in appropriate directory
2. Import required utilities
3. Follow test patterns
4. Add documentation
5. Update test index

### Code Review Checklist
- [ ] Tests follow naming conventions
- [ ] Tests are isolated
- [ ] Error cases are covered
- [ ] Performance is measured
- [ ] Documentation is updated

## Resources

### Official Documentation
- [Playwright Documentation](https://playwright.dev)
- [Jest Documentation](https://jestjs.io)
- [TypeScript Documentation](https://www.typescriptlang.org)

### Internal Resources
- Test Utilities API Reference
- Performance Benchmarks
- Test Data Templates 