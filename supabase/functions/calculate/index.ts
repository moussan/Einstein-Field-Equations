// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/supabase_functions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Constants
const G = 6.67430e-11; // Gravitational constant
const c = 299792458; // Speed of light

// Type definitions
interface CalculationRequest {
  type: string;
  inputs: Record<string, any>;
}

interface CalculationResponse {
  results: Record<string, any>;
  calculation_time: number;
  error?: string;
}

// Main handler function
serve(async (req) => {
  // CORS headers
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers, status: 204 });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { headers, status: 405 }
    );
  }

  try {
    // Parse request body
    const requestData: CalculationRequest = await req.json();
    const { type, inputs } = requestData;

    // Validate request
    if (!type || !inputs) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: type and inputs" }),
        { headers, status: 400 }
      );
    }

    // Start timing the calculation
    const startTime = performance.now();

    // Perform the calculation based on type
    let results;
    switch (type) {
      case "schwarzschild":
        results = calculateSchwarzschildMetric(inputs);
        break;
      case "kerr":
        results = calculateKerrMetric(inputs);
        break;
      case "flrw":
        results = calculateFLRWMetric(inputs);
        break;
      case "christoffel":
        results = calculateChristoffelSymbols(inputs);
        break;
      case "ricci-tensor":
        results = calculateRicciTensor(inputs);
        break;
      case "riemann-tensor":
        results = calculateRiemannTensor(inputs);
        break;
      default:
        return new Response(
          JSON.stringify({ error: `Unsupported calculation type: ${type}` }),
          { headers, status: 400 }
        );
    }

    // Calculate elapsed time
    const endTime = performance.now();
    const calculationTime = (endTime - startTime) / 1000; // Convert to seconds

    // Prepare response
    const response: CalculationResponse = {
      results,
      calculation_time: calculationTime,
    };

    // Return the results
    return new Response(JSON.stringify(response), { headers, status: 200 });
  } catch (error) {
    console.error("Error processing calculation:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { headers, status: 500 }
    );
  }
});

// Calculation functions

function calculateSchwarzschildMetric(inputs: Record<string, any>) {
  const { mass, radius, theta, phi } = inputs;
  
  // Schwarzschild metric components
  const g_tt = -(1 - (2 * G * mass) / (c * c * radius));
  const g_rr = 1 / (1 - (2 * G * mass) / (c * c * radius));
  const g_theta_theta = radius * radius;
  const g_phi_phi = radius * radius * Math.sin(theta) * Math.sin(theta);
  
  return {
    metricComponents: {
      g_tt,
      g_rr,
      g_theta_theta,
      g_phi_phi
    },
    ricciscalar: (2 * G * mass) / (c * c * radius * radius * radius),
    eventHorizon: (2 * G * mass) / (c * c)
  };
}

function calculateKerrMetric(inputs: Record<string, any>) {
  const { mass, angular_momentum, radius, theta } = inputs;
  
  // This is a simplified implementation
  // In a real application, this would be a complex calculation
  
  const a = angular_momentum;
  const r = radius;
  const sin_theta = Math.sin(theta);
  const cos_theta = Math.cos(theta);
  
  const rho_squared = r * r + a * a * cos_theta * cos_theta;
  const delta = r * r - 2 * mass * r + a * a;
  
  const g_tt = -(1 - (2 * mass * r) / rho_squared);
  const g_rr = rho_squared / delta;
  const g_theta_theta = rho_squared;
  const g_phi_phi = (r * r + a * a + (2 * mass * r * a * a * sin_theta * sin_theta) / rho_squared) * sin_theta * sin_theta;
  
  return {
    metricComponents: {
      g_tt,
      g_rr,
      g_theta_theta,
      g_phi_phi
    },
    ricciscalar: 0, // Kerr is a vacuum solution, so Ricci scalar is 0
    eventHorizon: mass + Math.sqrt(mass * mass - a * a)
  };
}

function calculateFLRWMetric(inputs: Record<string, any>) {
  const { scale_factor, k, radius, theta } = inputs;
  
  // This is a simplified implementation
  // In a real application, this would be a complex calculation
  
  const a = scale_factor;
  const r = radius;
  
  let g_rr;
  if (k === 0) {
    g_rr = a * a;
  } else if (k === 1) {
    g_rr = a * a / (1 - r * r);
  } else if (k === -1) {
    g_rr = a * a / (1 + r * r);
  } else {
    g_rr = a * a;
  }
  
  return {
    metricComponents: {
      g_tt: -1,
      g_rr,
      g_theta_theta: a * a * r * r,
      g_phi_phi: a * a * r * r * Math.sin(theta) * Math.sin(theta)
    },
    ricciscalar: 6 * (a * a + k) / (a * a * a * a),
    hubbleParameter: inputs.hubble_parameter || 70 // km/s/Mpc
  };
}

function calculateChristoffelSymbols(inputs: Record<string, any>) {
  const { metric_type, ...metricInputs } = inputs;
  
  // Get the metric components based on the metric type
  let metricComponents;
  switch (metric_type) {
    case "schwarzschild":
      metricComponents = calculateSchwarzschildMetric(metricInputs).metricComponents;
      break;
    case "kerr":
      metricComponents = calculateKerrMetric(metricInputs).metricComponents;
      break;
    case "flrw":
      metricComponents = calculateFLRWMetric(metricInputs).metricComponents;
      break;
    default:
      throw new Error(`Unsupported metric type for Christoffel symbols: ${metric_type}`);
  }
  
  // This is a simplified implementation
  // In a real application, this would calculate the actual Christoffel symbols
  
  return {
    christoffelSymbols: {
      Gamma_ttt: 0,
      Gamma_ttr: 0,
      // ... other components would be calculated here
    }
  };
}

function calculateRicciTensor(inputs: Record<string, any>) {
  // This would calculate the Ricci tensor components
  // For simplicity, we're returning placeholder values
  
  return {
    ricciTensorComponents: {
      R_tt: 0,
      R_rr: 0,
      R_theta_theta: 0,
      R_phi_phi: 0
    }
  };
}

function calculateRiemannTensor(inputs: Record<string, any>) {
  // This would calculate the Riemann tensor components
  // For simplicity, we're returning placeholder values
  
  return {
    riemannTensorComponents: {
      // Placeholder for Riemann tensor components
      R_trtr: 0,
      // ... other components would be calculated here
    }
  };
} 