import { assertEquals, assertThrows } from "https://deno.land/std/testing/asserts.ts";
import { serve } from "../../../supabase/functions/calculate/index.ts";
import { calculateMetric } from "../../../supabase/functions/calculate/metrics.ts";

Deno.test("Calculate Edge Function - Schwarzschild Metric", async () => {
  const request = new Request("http://localhost:8000/calculate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "schwarzschild",
      parameters: {
        mass: 1.0,
      },
    }),
  });

  const response = await serve(request);
  const data = await response.json();

  assertEquals(response.status, 200);
  assertEquals(data.metric_type, "schwarzschild");
  assertEquals(data.components.g00, "-1");
  assertEquals(data.components.g11, "1/(1-2M/r)");
  assertEquals(data.components.g22, "r^2");
  assertEquals(data.components.g33, "r^2 * sin^2(θ)");
});

Deno.test("Calculate Edge Function - Kerr Metric", async () => {
  const request = new Request("http://localhost:8000/calculate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "kerr",
      parameters: {
        mass: 1.0,
        angular_momentum: 0.5,
      },
    }),
  });

  const response = await serve(request);
  const data = await response.json();

  assertEquals(response.status, 200);
  assertEquals(data.metric_type, "kerr");
  // Add specific assertions for Kerr metric components
});

Deno.test("Calculate Edge Function - Invalid Input", async () => {
  const request = new Request("http://localhost:8000/calculate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "invalid_metric",
    }),
  });

  const response = await serve(request);
  assertEquals(response.status, 400);
});

Deno.test("Calculate Edge Function - Missing Parameters", async () => {
  const request = new Request("http://localhost:8000/calculate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "schwarzschild",
    }),
  });

  const response = await serve(request);
  assertEquals(response.status, 400);
});

Deno.test("Calculate Edge Function - Invalid Method", async () => {
  const request = new Request("http://localhost:8000/calculate", {
    method: "GET",
  });

  const response = await serve(request);
  assertEquals(response.status, 405);
});

Deno.test("Metric Calculation - Schwarzschild", () => {
  const result = calculateMetric("schwarzschild", { mass: 1.0 });
  assertEquals(result.success, true);
  assertEquals(result.components.g00, "-1");
});

Deno.test("Metric Calculation - Invalid Parameters", () => {
  assertThrows(
    () => calculateMetric("schwarzschild", { mass: -1.0 }),
    Error,
    "Mass must be positive"
  );
});

Deno.test("Metric Calculation - Performance", async () => {
  const start = performance.now();
  calculateMetric("schwarzschild", { mass: 1.0 });
  const end = performance.now();
  
  // Ensure calculation completes within 100ms
  assert((end - start) < 100, "Calculation took too long");
}); 