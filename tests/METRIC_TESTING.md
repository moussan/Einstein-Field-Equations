# Einstein Field Equations Metric Testing Guide

## Overview
This guide focuses on testing the calculation and visualization of various metrics in general relativity, including Schwarzschild, Kerr, and Reissner-Nordström metrics.

## Metric Types and Parameters

### Schwarzschild Metric
```typescript
interface SchwarzschildParameters {
  mass: number;  // M > 0
}

const expectedComponents = {
  g00: '-1',
  g11: '1/(1-2M/r)',
  g22: 'r^2',
  g33: 'r^2 * sin^2(θ)'
};
```

### Kerr Metric
```typescript
interface KerrParameters {
  mass: number;           // M > 0
  angular_momentum: number; // 0 ≤ a ≤ M
}

const expectedComponents = {
  g00: '-(1 - 2Mr/ρ²)',
  g11: 'ρ²/Δ',
  g22: 'ρ²',
  g33: '(r² + a² + 2Ma²r*sin²(θ)/ρ²)*sin²(θ)',
  g03: '-2Mar*sin²(θ)/ρ²'
};
```

### Reissner-Nordström Metric
```typescript
interface ReissnerNordstromParameters {
  mass: number;   // M > 0
  charge: number; // Q, with Q² ≤ M²
}

const expectedComponents = {
  g00: '-(1 - 2M/r + Q²/r²)',
  g11: '1/(1 - 2M/r + Q²/r²)',
  g22: 'r²',
  g33: 'r²*sin²(θ)'
};
```

## Test Cases

### 1. Parameter Validation

```typescript
test('validates metric parameters', async ({ page }) => {
  // Test invalid mass
  await calculateTestMetric(page, 'schwarzschild', { mass: -1.0 });
  expect(await page.textContent('[data-testid="error-message"]'))
    .toContain('Mass must be positive');

  // Test invalid angular momentum
  await calculateTestMetric(page, 'kerr', {
    mass: 1.0,
    angular_momentum: 1.5  // a > M
  });
  expect(await page.textContent('[data-testid="error-message"]'))
    .toContain('Angular momentum must not exceed mass');

  // Test invalid charge
  await calculateTestMetric(page, 'reissner_nordstrom', {
    mass: 1.0,
    charge: 1.5  // Q² > M²
  });
  expect(await page.textContent('[data-testid="error-message"]'))
    .toContain('Charge squared must not exceed mass squared');
});
```

### 2. Metric Component Calculations

```typescript
test('calculates metric components correctly', async ({ page }) => {
  // Test Schwarzschild metric
  const schwarzschildResult = await calculateTestMetric(
    page,
    'schwarzschild',
    { mass: 1.0 }
  );
  expectMetricComponents(schwarzschildResult, 'schwarzschild');

  // Test Kerr metric
  const kerrResult = await calculateTestMetric(
    page,
    'kerr',
    {
      mass: 2.0,
      angular_momentum: 1.0
    }
  );
  expectMetricComponents(kerrResult, 'kerr');
});
```

### 3. Coordinate System Tests

```typescript
test('handles coordinate transformations', async ({ page }) => {
  // Test spherical coordinates
  await page.selectOption('[data-testid="coordinate-system"]', 'spherical');
  await calculateTestMetric(page, 'schwarzschild', { mass: 1.0 });
  
  // Test isotropic coordinates
  await page.selectOption('[data-testid="coordinate-system"]', 'isotropic');
  await calculateTestMetric(page, 'schwarzschild', { mass: 1.0 });
  
  // Verify coordinate invariants
  const invariants = await page.textContent('[data-testid="invariants"]');
  expect(invariants).toContain('Ricci scalar: 0');
});
```

### 4. Singularity Tests

```typescript
test('handles metric singularities', async ({ page }) => {
  // Test Schwarzschild radius
  await calculateTestMetric(page, 'schwarzschild', { mass: 1.0 });
  await page.fill('[data-testid="r-coordinate"]', '2.0');  // r = 2M
  expect(await page.textContent('[data-testid="singularity-warning"]'))
    .toContain('Coordinate singularity');

  // Test Kerr ring singularity
  await calculateTestMetric(page, 'kerr', {
    mass: 1.0,
    angular_momentum: 0.5
  });
  await page.fill('[data-testid="r-coordinate"]', '0.0');
  await page.fill('[data-testid="theta-coordinate"]', '1.5708');  // π/2
  expect(await page.textContent('[data-testid="singularity-warning"]'))
    .toContain('Ring singularity');
});
```

### 5. Visualization Tests

```typescript
test('renders metric visualizations', async ({ page }) => {
  // Test horizon visualization
  await calculateTestMetric(page, 'schwarzschild', { mass: 1.0 });
  const horizonCanvas = await page.waitForSelector('[data-testid="horizon-viz"]');
  expect(await horizonCanvas.screenshot())
    .toMatchSnapshot('schwarzschild-horizon.png');

  // Test geodesic visualization
  await page.click('[data-testid="show-geodesics"]');
  const geodesicCanvas = await page.waitForSelector('[data-testid="geodesic-viz"]');
  expect(await geodesicCanvas.screenshot())
    .toMatchSnapshot('schwarzschild-geodesics.png');
});
```

### 6. Performance Tests

```typescript
test('meets performance requirements', async ({ page }) => {
  // Test calculation time
  const calcResult = await measurePerformance(
    async () => {
      await calculateTestMetric(page, 'kerr', {
        mass: 1.0,
        angular_momentum: 0.5
      });
    },
    1000  // Should complete within 1 second
  );
  expect(calcResult.success).toBe(true);

  // Test visualization rendering time
  const vizResult = await measurePerformance(
    async () => {
      await page.click('[data-testid="show-visualization"]');
      await page.waitForSelector('[data-testid="3d-viz"]');
    },
    2000  // Should render within 2 seconds
  );
  expect(vizResult.success).toBe(true);
});
```

## Best Practices

### 1. Parameter Testing
- Test boundary conditions (M = 0, a = M, Q² = M²)
- Test typical values
- Test extreme values (very large/small parameters)
- Verify error messages for invalid inputs

### 2. Component Testing
- Verify all metric components
- Check symmetries (g_μν = g_νμ)
- Verify determinant
- Check asymptotic behavior

### 3. Visualization Testing
- Verify correct scaling
- Check color mapping
- Test interactive features
- Verify coordinate grid

### 4. Performance Considerations
- Monitor calculation time scaling
- Check memory usage
- Verify browser performance
- Test with different hardware capabilities

## Common Issues

### 1. Numerical Precision
```typescript
test('handles numerical precision', async ({ page }) => {
  const result = await calculateTestMetric(page, 'schwarzschild', {
    mass: 1e-10  // Very small mass
  });
  expect(result.precision).toBeGreaterThan(10);
});
```

### 2. Browser Compatibility
```typescript
test.describe('cross-browser tests', () => {
  for (const browserType of ['chromium', 'firefox', 'webkit']) {
    test(`calculates metrics in ${browserType}`, async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      // Run calculations and verify results
    });
  }
});
```

### 3. Memory Management
```typescript
test('handles large calculations', async ({ page }) => {
  const initialMemory = await page.evaluate(() => performance.memory.usedJSHeapSize);
  
  // Perform multiple calculations
  for (let i = 0; i < 100; i++) {
    await calculateTestMetric(page, 'kerr', {
      mass: 1.0 + i*0.1,
      angular_momentum: 0.5
    });
  }
  
  const finalMemory = await page.evaluate(() => performance.memory.usedJSHeapSize);
  expect(finalMemory - initialMemory).toBeLessThan(50 * 1024 * 1024); // 50MB limit
});
```

## Maintenance

### 1. Updating Test Data
- Keep test parameters current
- Update expected results when equations change
- Maintain visualization snapshots
- Document changes in physical interpretations

### 2. Performance Monitoring
- Track calculation times
- Monitor memory usage
- Update performance thresholds
- Document hardware requirements

### 3. Documentation
- Keep parameter descriptions updated
- Document new test cases
- Update troubleshooting guides
- Maintain API references 