# Test Utilities Quick Reference

## Authentication

```typescript
// Get Supabase client
const supabase = getTestSupabaseClient();

// Login user
await loginTestUser(page);

// Login with custom credentials
await loginTestUser(page, {
  email: 'custom@example.com',
  password: 'custom-password'
});
```

## Metric Calculations

```typescript
// Basic calculation
await calculateTestMetric(page, 'schwarzschild', { mass: 1.0 });

// Generate test data
const data = generateTestMetricData('kerr');  // { mass: 1.0, angular_momentum: 0.5 }

// Validate components
expectMetricComponents(result, 'schwarzschild');
```

## Performance Testing

```typescript
// Basic measurement
const result = await measurePerformance(
  async () => { /* operation */ },
  1000  // max duration in ms
);

// With options
const result = await measurePerformance(
  callback,
  {
    maxDuration: 1000,
    allowedDeviation: 100,
    retries: 3
  }
);
```

## Network Simulation

```typescript
// Offline mode
await simulateNetworkConditions(page, 'offline');

// Slow network
await simulateNetworkConditions(page, 'slow');

// Normal network
await simulateNetworkConditions(page, 'fast');
```

## Error Testing

```typescript
// Network error
await simulateError(page, 'network');

// Validation error
await simulateError(page, 'validation');

// Server error
await simulateError(page, 'server');
```

## Screenshots

```typescript
// Basic screenshot
await captureScreenshot(page, 'test-state');

// Full page screenshot
await captureScreenshot(page, 'full-page', true);

// With timestamp
const path = await captureScreenshot(page, 'debug', false);
```

## Data Cleanup

```typescript
// Clean test data
await cleanupTestData(supabase);

// Clean specific user
await cleanupTestData(supabase, userId);

// Clean with options
await cleanupTestData(supabase, {
  calculations: true,
  users: false
});
```

## Common Patterns

### Setup and Teardown
```typescript
test.describe('test group', () => {
  const supabase = getTestSupabaseClient();

  test.beforeEach(async ({ page }) => {
    await loginTestUser(page);
  });

  test.afterEach(async () => {
    await cleanupTestData(supabase);
  });
});
```

### Error Handling
```typescript
test('handles errors', async ({ page }) => {
  await simulateError(page, 'network');
  await expect(page.locator('[data-testid="error"]')).toBeVisible();
  await simulateNetworkConditions(page, 'fast');
  await expect(page.locator('[data-testid="success"]')).toBeVisible();
});
```

### Performance Testing
```typescript
test('performance requirements', async ({ page }) => {
  const result = await measurePerformance(
    async () => {
      await calculateTestMetric(page, 'schwarzschild', { mass: 1.0 });
    },
    process.env.MAX_CALCULATION_TIME
  );
  expect(result.success).toBe(true);
});
```

## Environment Variables

```env
# Required
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-anon-key
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=test-password

# Optional
MAX_CALCULATION_TIME=2000
MAX_API_RESPONSE_TIME=1000
ENABLE_PERFORMANCE_TESTS=true
```

## Test Data

```typescript
// Metric parameters
const metricData = {
  schwarzschild: { mass: 1.0 },
  kerr: { mass: 1.0, angular_momentum: 0.5 },
  reissner_nordstrom: { mass: 1.0, charge: 0.3 }
};

// Expected results
const expectedResults = {
  schwarzschild: {
    g00: '-1',
    g11: '1/(1-2M/r)',
    g22: 'r^2',
    g33: 'r^2 * sin^2(θ)'
  }
};
```

## Common Selectors

```typescript
// Form elements
'[data-testid="metric-type"]'
'[data-testid="mass-input"]'
'[data-testid="calculate-button"]'

// Results
'[data-testid="results-container"]'
'[data-testid="error-message"]'
'[data-testid="loading-indicator"]'

// Visualization
'[data-testid="horizon-viz"]'
'[data-testid="geodesic-viz"]'
'[data-testid="3d-viz"]'
```

## Command Line Options

```bash
# Run specific test
npx playwright test tests/path/to/test.ts

# Run with debugging
npx playwright test --debug

# Update snapshots
npx playwright test --update-snapshots

# Run in specific browser
npx playwright test --browser=firefox
```

## Best Practices

1. **Test Organization**
   ```typescript
   test.describe('feature', () => {
     test.describe('subfeature', () => {
       test('specific case', async () => {});
     });
   });
   ```

2. **Error Handling**
   ```typescript
   try {
     await calculateTestMetric(page, 'invalid', {});
   } catch (error) {
     expect(error.message).toContain('Invalid metric type');
   }
   ```

3. **Async Operations**
   ```typescript
   await Promise.all([
     page.waitForResponse('**/api/calculate'),
     page.click('[data-testid="calculate-button"]')
   ]);
   ```

4. **Visual Testing**
   ```typescript
   await expect(page).toHaveScreenshot('calculation-result.png', {
     maxDiffPixels: 100
   });
   ```

## Troubleshooting

1. **Timeouts**
   ```typescript
   test.setTimeout(120000);
   await page.waitForSelector('[data-testid="results"]', { timeout: 10000 });
   ```

2. **Network Issues**
   ```typescript
   test.retry(3);
   await page.waitForLoadState('networkidle');
   ```

3. **State Issues**
   ```typescript
   await page.reload();
   await page.evaluate(() => window.localStorage.clear());
   ``` 