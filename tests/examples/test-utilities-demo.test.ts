import { test, expect } from '@playwright/test';
import {
  loginTestUser,
  calculateTestMetric,
  generateTestMetricData,
  measurePerformance,
  simulateNetworkConditions,
  expectMetricComponents,
  simulateError,
  captureScreenshot,
  cleanupTestData,
  getTestSupabaseClient
} from '../utils/test-helpers';

test.describe('Test Utilities Demo', () => {
  const supabase = getTestSupabaseClient();

  test.beforeEach(async ({ page }) => {
    // Demonstrate login helper
    await loginTestUser(page);
  });

  test.afterEach(async () => {
    // Demonstrate cleanup helper
    await cleanupTestData(supabase);
  });

  test('demonstrates basic calculation flow with helpers', async ({ page }) => {
    // Demonstrate test data generation
    const metricData = generateTestMetricData('schwarzschild');
    
    // Demonstrate calculation helper
    await calculateTestMetric(page, 'schwarzschild', metricData);
    
    // Get results and verify
    const results = await page.textContent('[data-testid="results-container"]');
    expect(results).toBeTruthy();
    
    // Demonstrate component validation
    const components = JSON.parse(results!);
    expectMetricComponents(components, 'schwarzschild');
  });

  test('demonstrates performance testing', async ({ page }) => {
    const metricData = generateTestMetricData('kerr');
    
    // Demonstrate performance measurement
    const result = await measurePerformance(
      async () => {
        await calculateTestMetric(page, 'kerr', metricData);
      },
      Number(process.env.MAX_CALCULATION_TIME)
    );
    
    expect(result.success).toBe(true);
    if (!result.success) {
      console.log(`Performance test failed: ${result.duration}ms`);
    }
  });

  test('demonstrates network condition testing', async ({ page }) => {
    // Setup calculation
    const metricData = generateTestMetricData();
    
    // Test offline behavior
    await simulateNetworkConditions(page, 'offline');
    await calculateTestMetric(page, 'schwarzschild', metricData);
    
    // Verify offline message
    const offlineMessage = await page.textContent('[data-testid="offline-message"]');
    expect(offlineMessage).toContain('offline');
    
    // Test slow network
    await simulateNetworkConditions(page, 'slow');
    const slowResult = await measurePerformance(
      async () => {
        await calculateTestMetric(page, 'schwarzschild', metricData);
      },
      5000  // Allow more time for slow network
    );
    expect(slowResult.success).toBe(true);
    
    // Restore network
    await simulateNetworkConditions(page, 'fast');
  });

  test('demonstrates error handling', async ({ page }) => {
    // Test network error
    await simulateError(page, 'network');
    await page.click('[data-testid="calculate-button"]');
    expect(await page.textContent('[data-testid="error-message"]'))
      .toContain('network');
    
    // Test validation error
    await simulateError(page, 'validation');
    await page.click('[data-testid="calculate-button"]');
    expect(await page.textContent('[data-testid="error-message"]'))
      .toContain('Mass must be positive');
    
    // Test server error
    await simulateError(page, 'server');
    await page.click('[data-testid="calculate-button"]');
    expect(await page.textContent('[data-testid="error-message"]'))
      .toContain('server error');
  });

  test('demonstrates screenshot capture', async ({ page }) => {
    // Setup a complex state
    const metricData = generateTestMetricData('kerr');
    await calculateTestMetric(page, 'kerr', metricData);
    
    // Capture different states
    await captureScreenshot(page, 'kerr-metric-results');
    
    // Simulate error and capture
    await simulateError(page, 'validation');
    await page.click('[data-testid="calculate-button"]');
    await captureScreenshot(page, 'validation-error');
    
    // Capture full page
    await captureScreenshot(page, 'full-page-state', true);
  });

  test('demonstrates complete error recovery flow', async ({ page }) => {
    const metricData = generateTestMetricData();
    
    // 1. Start with network error
    await simulateError(page, 'network');
    await calculateTestMetric(page, 'schwarzschild', metricData);
    await captureScreenshot(page, 'network-error-state');
    
    // 2. Restore network and retry
    await simulateNetworkConditions(page, 'fast');
    await page.click('[data-testid="retry-button"]');
    
    // 3. Measure recovery performance
    const recoveryResult = await measurePerformance(
      async () => {
        await page.waitForSelector('[data-testid="results-container"]');
      },
      Number(process.env.MAX_API_RESPONSE_TIME)
    );
    
    expect(recoveryResult.success).toBe(true);
    
    // 4. Verify final state
    const results = await page.textContent('[data-testid="results-container"]');
    expect(results).toBeTruthy();
  });
}); 