import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

test.describe('Calculation Flow Integration Tests', () => {
  let authToken: string;

  test.beforeAll(async () => {
    const { data: { session }, error } = await supabase.auth.signInWithPassword({
      email: process.env.TEST_USER_EMAIL!,
      password: process.env.TEST_USER_PASSWORD!,
    });
    expect(error).toBeNull();
    authToken = session!.access_token;
  });

  test('complete calculation flow', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', process.env.TEST_USER_EMAIL!);
    await page.fill('[data-testid="password-input"]', process.env.TEST_USER_PASSWORD!);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');

    // 2. Navigate to calculation page
    await page.click('[data-testid="new-calculation"]');
    await page.waitForURL('/calculate');

    // 3. Fill calculation form
    await page.selectOption('[data-testid="metric-type"]', 'schwarzschild');
    await page.fill('[data-testid="mass-input"]', '1.0');
    await page.click('[data-testid="calculate-button"]');

    // 4. Wait for results
    await page.waitForSelector('[data-testid="results-container"]');
    const results = await page.textContent('[data-testid="results-container"]');
    expect(results).toContain('g₀₀ = -1');

    // 5. Check visualization
    const canvas = await page.waitForSelector('canvas');
    expect(canvas).toBeTruthy();

    // 6. Save calculation
    await page.click('[data-testid="save-calculation"]');
    await page.waitForSelector('[data-testid="save-success"]');

    // 7. Verify in history
    await page.click('[data-testid="view-history"]');
    await page.waitForURL('/history');
    const historyEntry = await page.textContent('[data-testid="calculation-history"]');
    expect(historyEntry).toContain('schwarzschild');
  });

  test('error handling in calculation flow', async ({ page }) => {
    await page.goto('/calculate');

    // 1. Try invalid input
    await page.selectOption('[data-testid="metric-type"]', 'schwarzschild');
    await page.fill('[data-testid="mass-input"]', '-1.0');
    await page.click('[data-testid="calculate-button"]');

    // 2. Check error message
    const error = await page.textContent('[data-testid="error-message"]');
    expect(error).toContain('Mass must be positive');

    // 3. Fix input and retry
    await page.fill('[data-testid="mass-input"]', '1.0');
    await page.click('[data-testid="calculate-button"]');

    // 4. Verify success
    await page.waitForSelector('[data-testid="results-container"]');
    const results = await page.textContent('[data-testid="results-container"]');
    expect(results).toContain('g₀₀ = -1');
  });

  test('performance requirements', async ({ page }) => {
    await page.goto('/calculate');

    // 1. Measure calculation time
    await page.selectOption('[data-testid="metric-type"]', 'schwarzschild');
    await page.fill('[data-testid="mass-input"]', '1.0');
    
    const startTime = Date.now();
    await page.click('[data-testid="calculate-button"]');
    await page.waitForSelector('[data-testid="results-container"]');
    const endTime = Date.now();

    // 2. Verify performance
    expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds

    // 3. Check response headers
    const response = await page.waitForResponse(response => 
      response.url().includes('/calculate') && response.status() === 200
    );
    const headers = response.headers();
    expect(headers['cache-control']).toBeTruthy();
  });

  test('offline functionality', async ({ page }) => {
    await page.goto('/calculate');

    // 1. Fill form
    await page.selectOption('[data-testid="metric-type"]', 'schwarzschild');
    await page.fill('[data-testid="mass-input"]', '1.0');

    // 2. Simulate offline
    await page.context().setOffline(true);
    await page.click('[data-testid="calculate-button"]');

    // 3. Check offline message
    const offlineMessage = await page.textContent('[data-testid="offline-message"]');
    expect(offlineMessage).toContain('offline');

    // 4. Restore online and verify recovery
    await page.context().setOffline(false);
    await page.click('[data-testid="retry-button"]');
    await page.waitForSelector('[data-testid="results-container"]');
  });
});

test.describe('API Integration Tests', () => {
  test('direct API calls', async () => {
    // 1. Test calculation endpoint
    const calcResponse = await fetch(`${process.env.SUPABASE_URL}/functions/v1/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        type: 'schwarzschild',
        parameters: { mass: 1.0 },
      }),
    });
    expect(calcResponse.status).toBe(200);
    const calcData = await calcResponse.json();
    expect(calcData.components.g00).toBe('-1');

    // 2. Test history endpoint
    const historyResponse = await fetch(`${process.env.SUPABASE_URL}/rest/v1/calculations`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    expect(historyResponse.status).toBe(200);
    const historyData = await historyResponse.json();
    expect(Array.isArray(historyData)).toBe(true);
  });

  test('rate limiting', async () => {
    const requests = Array(10).fill(null).map(() => 
      fetch(`${process.env.SUPABASE_URL}/functions/v1/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          type: 'schwarzschild',
          parameters: { mass: 1.0 },
        }),
      })
    );

    const responses = await Promise.all(requests);
    const rateLimited = responses.some(r => r.status === 429);
    expect(rateLimited).toBe(true);
  });
}); 