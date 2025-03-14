import { assertEquals, assertExists } from "https://deno.land/std@0.168.0/testing/asserts.ts";

// Mock the serve function
const mockResponses = [];
const mockServe = (handler) => {
  Deno.test("Edge Function Tests", async (t) => {
    // Test valid Schwarzschild calculation
    await t.step("should calculate Schwarzschild metric correctly", async () => {
      const req = new Request("https://example.com/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "schwarzschild",
          inputs: {
            mass: 1.0,
            radius: 10.0,
            theta: Math.PI / 2,
          },
        }),
      });

      const response = await handler(req);
      assertEquals(response.status, 200);
      
      const data = await response.json();
      assertExists(data.results);
      assertExists(data.calculation_time);
      
      const { results } = data;
      assertExists(results.metricComponents);
      assertExists(results.metricComponents.g_tt);
      assertExists(results.metricComponents.g_rr);
      assertExists(results.metricComponents.g_theta_theta);
      assertExists(results.metricComponents.g_phi_phi);
      assertExists(results.eventHorizon);
    });

    // Test valid Kerr calculation
    await t.step("should calculate Kerr metric correctly", async () => {
      const req = new Request("https://example.com/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "kerr",
          inputs: {
            mass: 1.0,
            angular_momentum: 0.5,
            radius: 10.0,
            theta: Math.PI / 2,
          },
        }),
      });

      const response = await handler(req);
      assertEquals(response.status, 200);
      
      const data = await response.json();
      assertExists(data.results);
      assertExists(data.calculation_time);
      
      const { results } = data;
      assertExists(results.metricComponents);
      assertExists(results.metricComponents.g_tt);
      assertExists(results.metricComponents.g_rr);
      assertExists(results.metricComponents.g_theta_theta);
      assertExists(results.metricComponents.g_phi_phi);
      assertExists(results.eventHorizon);
    });

    // Test missing required fields
    await t.step("should return 400 for missing fields", async () => {
      const req = new Request("https://example.com/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Missing type
          inputs: {
            mass: 1.0,
            radius: 10.0,
            theta: Math.PI / 2,
          },
        }),
      });

      const response = await handler(req);
      assertEquals(response.status, 400);
      
      const data = await response.json();
      assertExists(data.error);
    });

    // Test unsupported calculation type
    await t.step("should return 400 for unsupported calculation type", async () => {
      const req = new Request("https://example.com/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "unsupported_type",
          inputs: {
            mass: 1.0,
            radius: 10.0,
            theta: Math.PI / 2,
          },
        }),
      });

      const response = await handler(req);
      assertEquals(response.status, 400);
      
      const data = await response.json();
      assertExists(data.error);
    });

    // Test method not allowed
    await t.step("should return 405 for method not allowed", async () => {
      const req = new Request("https://example.com/calculate", {
        method: "GET",
      });

      const response = await handler(req);
      assertEquals(response.status, 405);
      
      const data = await response.json();
      assertExists(data.error);
    });

    // Test CORS preflight
    await t.step("should handle CORS preflight", async () => {
      const req = new Request("https://example.com/calculate", {
        method: "OPTIONS",
      });

      const response = await handler(req);
      assertEquals(response.status, 204);
    });

    // Test Einstein tensor calculation
    await t.step("should calculate Einstein tensor correctly", async () => {
      const req = new Request("https://example.com/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "einstein_tensor",
          inputs: {
            metric_type: "schwarzschild",
            mass: 1.0,
            radius: 10.0,
            theta: Math.PI / 2,
          },
        }),
      });

      const response = await handler(req);
      assertEquals(response.status, 200);
      
      const data = await response.json();
      assertExists(data.results);
      assertExists(data.calculation_time);
      
      const { results } = data;
      assertExists(results.einsteinTensorComponents);
    });

    // Test Hawking radiation calculation
    await t.step("should calculate Hawking radiation correctly", async () => {
      const req = new Request("https://example.com/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "hawking_radiation",
          inputs: {
            mass: 1.0,
            charge: 0.0,
            angular_momentum: 0.0,
          },
        }),
      });

      const response = await handler(req);
      assertEquals(response.status, 200);
      
      const data = await response.json();
      assertExists(data.results);
      assertExists(data.calculation_time);
      
      const { results } = data;
      assertExists(results.hawkingComponents);
      assertExists(results.hawkingComponents.temperature);
    });
  });
};

// Export the mock serve function to be used in place of the real one
export { mockServe as serve }; 