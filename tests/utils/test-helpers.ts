import { Page } from '@playwright/test';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TestClient } from '@testing-library/react';

/**
 * Test utilities for the Einstein Field Equations project
 */

// Authentication helpers
export const getTestSupabaseClient = (): SupabaseClient => {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );
};

export const loginTestUser = async (page: Page): Promise<void> => {
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', process.env.TEST_USER_EMAIL!);
  await page.fill('[data-testid="password-input"]', process.env.TEST_USER_PASSWORD!);
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('/dashboard');
};

// Metric calculation helpers
export const calculateTestMetric = async (page: Page, type: string, parameters: Record<string, number>): Promise<void> => {
  await page.goto('/calculate');
  await page.selectOption('[data-testid="metric-type"]', type);
  
  for (const [key, value] of Object.entries(parameters)) {
    await page.fill(`[data-testid="${key}-input"]`, value.toString());
  }
  
  await page.click('[data-testid="calculate-button"]');
  await page.waitForSelector('[data-testid="results-container"]');
};

// Test data generators
export const generateTestMetricData = (type: string = 'schwarzschild'): Record<string, number> => {
  const data: Record<string, Record<string, number>> = {
    schwarzschild: { mass: 1.0 },
    kerr: { mass: 1.0, angular_momentum: 0.5 },
    reissner_nordstrom: { mass: 1.0, charge: 0.3 }
  };
  return data[type] || data.schwarzschild;
};

// Performance testing helpers
export interface PerformanceResult {
  duration: number;
  success: boolean;
  error?: string;
}

export const measurePerformance = async (
  callback: () => Promise<void>,
  maxDuration: number
): Promise<PerformanceResult> => {
  const start = Date.now();
  try {
    await callback();
    const duration = Date.now() - start;
    return {
      duration,
      success: duration <= maxDuration
    };
  } catch (error) {
    return {
      duration: Date.now() - start,
      success: false,
      error: error.message
    };
  }
};

// Network condition simulators
export const simulateNetworkConditions = async (
  page: Page,
  conditions: 'offline' | 'slow' | 'fast'
): Promise<void> => {
  switch (conditions) {
    case 'offline':
      await page.context().setOffline(true);
      break;
    case 'slow':
      await page.route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.continue();
      });
      break;
    case 'fast':
      await page.context().setOffline(false);
      await page.unroute('**/*');
      break;
  }
};

// Assertion helpers
export const expectMetricComponents = (
  components: Record<string, string>,
  expectedType: string
): void => {
  const expectations: Record<string, Record<string, string>> = {
    schwarzschild: {
      g00: '-1',
      g11: '1/(1-2M/r)',
      g22: 'r^2',
      g33: 'r^2 * sin^2(θ)'
    },
    kerr: {
      // Add Kerr metric expectations
    }
  };
  
  const expected = expectations[expectedType];
  for (const [key, value] of Object.entries(expected)) {
    expect(components[key]).toBe(value);
  }
};

// Clean up helpers
export const cleanupTestData = async (supabase: SupabaseClient): Promise<void> => {
  // Clean up test calculations
  await supabase
    .from('calculations')
    .delete()
    .eq('user_id', process.env.TEST_USER_ID);
    
  // Clean up test user data if needed
  // Add more cleanup as needed
};

// Error simulation helpers
export const simulateError = async (
  page: Page,
  errorType: 'network' | 'validation' | 'server'
): Promise<void> => {
  switch (errorType) {
    case 'network':
      await page.route('**/api/**', route => route.abort('failed'));
      break;
    case 'validation':
      await page.fill('[data-testid="mass-input"]', '-1.0');
      break;
    case 'server':
      await page.route('**/api/**', route => 
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal Server Error' })
        })
      );
      break;
  }
};

// Screenshot helpers
export const captureScreenshot = async (
  page: Page,
  name: string,
  fullPage: boolean = false
): Promise<string> => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const path = `test-results/screenshots/${name}-${timestamp}.png`;
  await page.screenshot({ path, fullPage });
  return path;
};

/**
 * Create a mock session for testing
 */
export const createMockSession = () => {
    return {
        access_token: 'mock-token',
        user: {
            id: 'mock-user-id',
            email: 'test@example.com',
            created_at: new Date().toISOString()
        }
    };
};

/**
 * Clear mock session
 */
export const clearMockSession = () => {
    localStorage.removeItem('user_session');
};

/**
 * Set up test environment
 */
export const setupTestEnv = () => {
    clearMockSession();
};

/**
 * Clean up test environment
 */
export const cleanupTestEnv = () => {
    clearMockSession();
};

/**
 * Create authenticated test client
 */
export const createAuthenticatedClient = (client: TestClient) => {
    const session = createMockSession();
    localStorage.setItem('user_session', JSON.stringify(session));
    return client;
}; 