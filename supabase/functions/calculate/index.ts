// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/supabase_functions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Constants
const G = 6.67430e-11; // Gravitational constant (m^3 kg^-1 s^-2)
const c = 299792458; // Speed of light (m/s)
const h = 6.62607015e-34; // Planck constant (J⋅s)
const k_B = 1.380649e-23; // Boltzmann constant (J/K)
const LAMBDA = 1.1056e-52; // Cosmological constant (m^-2)

// Type definitions for better type safety
interface CalculationInput {
  [key: string]: number | string | boolean | object;
}

interface CalculationRequest {
  type: string;
  inputs: CalculationInput;
  include_all_components?: boolean;
}

interface CalculationResponse {
  results: Record<string, any>;
  calculation_time: number;
  error?: string;
}

// Memoization implementation for expensive calculations
const memoize = <T>(fn: (...args: any[]) => T) => {
  const cache = new Map();
  return (...args: any[]): T => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    // Limit cache size to prevent memory issues
    if (cache.size > 100) {
      // Remove oldest entry (first key)
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    return result;
  };
};

// Memoized calculation functions
const calculateSchwarzschildMetric = memoize((mass: number, radius: number, theta: number) => {
  // Schwarzschild metric calculation
  const rs = 2 * mass; // Schwarzschild radius
  const g_tt = -(1 - rs / radius);
  const g_rr = 1 / (1 - rs / radius);
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
    eventHorizon: rs
  };
});

const calculateKerrMetric = memoize((mass: number, angular_momentum: number, radius: number, theta: number) => {
  // Kerr metric calculation
  const rs = 2 * mass;
  const a = angular_momentum / mass;
  const rho2 = radius * radius + a * a * Math.cos(theta) * Math.cos(theta);
  const delta = radius * radius - rs * radius + a * a;
  
  const g_tt = -((1 - rs * radius / rho2));
  const g_rr = rho2 / delta;
  const g_theta_theta = rho2;
  const g_phi_phi = (radius * radius + a * a + rs * radius * a * a * Math.sin(theta) * Math.sin(theta) / rho2) * Math.sin(theta) * Math.sin(theta);
  
  // Calculate event horizon (outer)
  const eventHorizon = mass + Math.sqrt(mass * mass - a * a);
  
  return {
    metricComponents: {
      g_tt,
      g_rr,
      g_theta_theta,
      g_phi_phi
    },
    ricciscalar: 0, // Kerr is a vacuum solution, so Ricci scalar is 0
    eventHorizon
  };
});

const calculateEinsteinTensor = memoize((metricType: string, inputs: CalculationInput) => {
  // Get the metric components first
  let metricComponents;
  
  if (metricType === 'schwarzschild') {
    const { mass, radius, theta } = inputs as { mass: number, radius: number, theta: number };
    metricComponents = calculateSchwarzschildMetric(mass, radius, theta).metricComponents;
  } else if (metricType === 'kerr') {
    const { mass, angular_momentum, radius, theta } = inputs as { mass: number, angular_momentum: number, radius: number, theta: number };
    metricComponents = calculateKerrMetric(mass, angular_momentum, radius, theta).metricComponents;
  } else {
    throw new Error(`Unsupported metric type: ${metricType}`);
  }
  
  // Calculate Einstein tensor components (simplified example)
  // In a real implementation, this would involve calculating Christoffel symbols,
  // Riemann tensor, Ricci tensor, and Ricci scalar
  
  // For vacuum solutions like Schwarzschild and Kerr, Einstein tensor is zero
  return {
    einsteinTensorComponents: {
      G_tt: 0,
      G_rr: 0,
      G_theta_theta: 0,
      G_phi_phi: 0
    }
  };
});

const calculateHawkingRadiation = memoize((mass: number, charge: number, angular_momentum: number) => {
  // Calculate Hawking temperature
  // For a Schwarzschild black hole: T = ℏc³/(8πGMk_B)
  // Using natural units (G = c = ℏ = k_B = 1)
  
  const a = angular_momentum / mass;
  const rPlus = mass + Math.sqrt(mass * mass - a * a - charge * charge);
  
  // Surface gravity
  const kappa = (rPlus - mass) / (2 * rPlus * rPlus + 2 * a * a);
  
  // Hawking temperature
  const temperature = kappa / (2 * Math.PI);
  
  // Entropy
  const entropy = Math.PI * (rPlus * rPlus + a * a);
  
  return {
    hawkingComponents: {
      temperature,
      entropy,
      surface_gravity: kappa
    }
  };
});

// Main handler function
serve(async (req: Request) => {
  // Start timing for performance measurement
  const startTime = performance.now();
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
  
  try {
    // Parse request body
    const requestData: CalculationRequest = await req.json();
    
    // Validate request
    if (!requestData.type) {
      return new Response(
        JSON.stringify({ error: 'Missing calculation type' }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }
    
    if (!requestData.inputs) {
      return new Response(
        JSON.stringify({ error: 'Missing calculation inputs' }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }
    
    // Perform calculation based on type
    let results;
    const includeAllComponents = requestData.include_all_components !== false; // Default to true
    
    switch (requestData.type) {
      case 'schwarzschild': {
        const { mass, radius, theta } = requestData.inputs as { mass: number, radius: number, theta: number };
        
        // Validate inputs
        if (mass <= 0 || radius <= 0) {
          throw new Error('Mass and radius must be positive');
        }
        
        results = calculateSchwarzschildMetric(mass, radius, theta);
        break;
      }
      
      case 'kerr': {
        const { mass, angular_momentum, radius, theta } = requestData.inputs as { mass: number, angular_momentum: number, radius: number, theta: number };
        
        // Validate inputs
        if (mass <= 0 || radius <= 0) {
          throw new Error('Mass and radius must be positive');
        }
        
        if (angular_momentum * angular_momentum > mass * mass) {
          throw new Error('Angular momentum squared cannot exceed mass squared (a² ≤ M²)');
        }
        
        results = calculateKerrMetric(mass, angular_momentum, radius, theta);
        break;
      }
      
      case 'einstein_tensor': {
        const { metric_type, ...metricInputs } = requestData.inputs as { metric_type: string } & CalculationInput;
        
        if (!metric_type) {
          throw new Error('Missing metric type for Einstein tensor calculation');
        }
        
        results = calculateEinsteinTensor(metric_type, metricInputs);
        break;
      }
      
      case 'hawking_radiation': {
        const { mass, charge = 0, angular_momentum = 0 } = requestData.inputs as { mass: number, charge?: number, angular_momentum?: number };
        
        // Validate inputs
        if (mass <= 0) {
          throw new Error('Mass must be positive');
        }
        
        if (angular_momentum * angular_momentum + charge * charge > mass * mass) {
          throw new Error('Cosmic censorship constraint violated: a² + Q² ≤ M²');
        }
        
        results = calculateHawkingRadiation(mass, charge, angular_momentum);
        break;
      }
      
      // Add other calculation types as needed
      
      default:
        return new Response(
          JSON.stringify({ error: `Unsupported calculation type: ${requestData.type}` }),
          { 
            status: 400,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            }
          }
        );
    }
    
    // Calculate execution time
    const calculationTime = (performance.now() - startTime) / 1000; // Convert to seconds
    
    // Optimize response size if not including all components
    if (!includeAllComponents && results.metricComponents) {
      // Only include essential components
      const { g_tt, g_rr } = results.metricComponents;
      results = {
        ...results,
        metricComponents: { g_tt, g_rr }
      };
    }
    
    // Return results
    return new Response(
      JSON.stringify({
        results,
        calculation_time: calculationTime
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'max-age=3600' // Cache for 1 hour
        } 
      }
    );
  } catch (error) {
    console.error(`Calculation error: ${error.message}`);
    
    // Determine appropriate status code
    let statusCode = 500;
    if (error.message.includes('must be positive') || 
        error.message.includes('constraint violated') ||
        error.message.includes('cannot exceed')) {
      statusCode = 400; // Bad request for validation errors
    }
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        error_type: error.name,
        calculation_time: (performance.now() - startTime) / 1000
      }),
      { 
        status: statusCode,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      }
    );
  }
});

// Calculation functions

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
      metricComponents = calculateSchwarzschildMetric(metricInputs.mass, metricInputs.radius, metricInputs.theta).metricComponents;
      break;
    case "kerr":
      metricComponents = calculateKerrMetric(metricInputs.mass, metricInputs.angular_momentum, metricInputs.radius, metricInputs.theta).metricComponents;
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

function calculateWeylTensor(inputs: Record<string, any>) {
  // This would calculate the Weyl tensor components
  // For simplicity, we're returning placeholder values
  
  return {
    weylTensorComponents: {
      // Placeholder for Weyl tensor components
      W_trtr: 0,
      // ... other components would be calculated here
    }
  };
}

function calculateGeodesicEquation(inputs: Record<string, any>) {
  // This would calculate the geodesic equation components
  // For simplicity, we're returning placeholder values
  
  return {
    geodesicEquationComponents: {
      // Placeholder for geodesic equation components
      d2t_dtau2: 0,
      d2r_dtau2: 0,
      d2theta_dtau2: 0,
      d2phi_dtau2: 0
    }
  };
}

function calculateEventHorizon(inputs: Record<string, any>) {
  // This would calculate the event horizon components
  // For simplicity, we're returning placeholder values
  
  return {
    eventHorizonComponents: {
      // Placeholder for event horizon components
      r_event_horizon: 0,
      // ... other components would be calculated here
    }
  };
}

function calculateGravitationalRedshift(inputs: Record<string, any>) {
  // This would calculate the gravitational redshift components
  // For simplicity, we're returning placeholder values
  
  return {
    gravitationalRedshiftComponents: {
      // Placeholder for gravitational redshift components
      redshift: 0,
      // ... other components would be calculated here
    }
  };
}

function calculateGravitationalLensing(inputs: Record<string, any>) {
  // This would calculate the gravitational lensing components
  // For simplicity, we're returning placeholder values
  
  return {
    gravitationalLensingComponents: {
      // Placeholder for gravitational lensing components
      deflection_angle: 0,
      // ... other components would be calculated here
    }
  };
}

function calculateGravitationalWaves(inputs: Record<string, any>) {
  // This would calculate the gravitational waves components
  // For simplicity, we're returning placeholder values
  
  return {
    gravitationalWavesComponents: {
      // Placeholder for gravitational waves components
      amplitude: 0,
      // ... other components would be calculated here
    }
  };
}

function calculateEnergyConditions(inputs: Record<string, any>) {
  // This would calculate the energy conditions components
  // For simplicity, we're returning placeholder values
  
  return {
    energyConditionsComponents: {
      // Placeholder for energy conditions components
      weak_energy_condition: true,
      strong_energy_condition: true,
      dominant_energy_condition: true
    }
  };
}

function calculateStressEnergyTensor(inputs: Record<string, any>) {
  // This would calculate the stress-energy tensor components
  // For simplicity, we're returning placeholder values
  
  return {
    stressEnergyTensorComponents: {
      T_tt: 0,
      T_rr: 0,
      T_theta_theta: 0,
      T_phi_phi: 0
    }
  };
}

function calculateVacuumSolution(inputs: Record<string, any>) {
  // This would calculate the vacuum solution components
  // For simplicity, we're returning placeholder values
  
  return {
    vacuumSolutionComponents: {
      // Placeholder for vacuum solution components
      g_tt: 0,
      g_rr: 0,
      g_theta_theta: 0,
      g_phi_phi: 0
    }
  };
}

function calculateMatterSolution(inputs: Record<string, any>) {
  // This would calculate the matter solution components
  // For simplicity, we're returning placeholder values
  
  return {
    matterSolutionComponents: {
      // Placeholder for matter solution components
      g_tt: 0,
      g_rr: 0,
      g_theta_theta: 0,
      g_phi_phi: 0
    }
  };
}

function calculateReissnerNordstrom(inputs: Record<string, any>) {
  // This would calculate the Reissner-Nordstrom components
  // For simplicity, we're returning placeholder values
  
  return {
    reissnerNordstromComponents: {
      // Placeholder for Reissner-Nordstrom components
      g_tt: 0,
      g_rr: 0,
      g_theta_theta: 0,
      g_phi_phi: 0
    }
  };
}

function calculateKerrNewman(inputs: Record<string, any>) {
  // This would calculate the Kerr-Newman components
  // For simplicity, we're returning placeholder values
  
  return {
    kerrNewmanComponents: {
      // Placeholder for Kerr-Newman components
      g_tt: 0,
      g_rr: 0,
      g_theta_theta: 0,
      g_phi_phi: 0
    }
  };
}

function calculateGodelMetric(inputs: Record<string, any>) {
  // This would calculate the Godel components
  // For simplicity, we're returning placeholder values
  
  return {
    godelComponents: {
      // Placeholder for Godel components
      g_tt: 0,
      g_rr: 0,
      g_theta_theta: 0,
      g_phi_phi: 0
    }
  };
}

function calculateFriedmannEquations(inputs: Record<string, any>) {
  // This would calculate the Friedmann components
  // For simplicity, we're returning placeholder values
  
  return {
    friedmannComponents: {
      // Placeholder for Friedmann components
      H: 0,
      // ... other components would be calculated here
    }
  };
}

function calculateBianchiIdentities(inputs: Record<string, any>) {
  // This would calculate the Bianchi components
  // For simplicity, we're returning placeholder values
  
  return {
    bianchiComponents: {
      // Placeholder for Bianchi components
      B_1: 0,
      B_2: 0,
      B_3: 0
    }
  };
}

function calculateKretschmannScalar(inputs: Record<string, any>) {
  // This would calculate the Kretschmann components
  // For simplicity, we're returning placeholder values
  
  return {
    kretschmannComponents: {
      // Placeholder for Kretschmann components
      K: 0,
      // ... other components would be calculated here
    }
  };
}

function calculatePenroseDiagram(inputs: Record<string, any>) {
  // This would calculate the Penrose components
  // For simplicity, we're returning placeholder values
  
  return {
    penroseComponents: {
      // Placeholder for Penrose components
      P: 0,
      // ... other components would be calculated here
    }
  };
}

function calculateBlackHoleThermodynamics(inputs: Record<string, any>) {
  // This would calculate the black hole thermodynamics components
  // For simplicity, we're returning placeholder values
  
  return {
    blackHoleThermodynamicsComponents: {
      // Placeholder for black hole thermodynamics components
      entropy: 0,
      // ... other components would be calculated here
    }
  };
}

function calculateCosmologicalConstant(inputs: Record<string, any>) {
  // This would calculate the cosmological constant components
  // For simplicity, we're returning placeholder values
  
  return {
    cosmologicalConstantComponents: {
      // Placeholder for cosmological constant components
      LAMBDA: 0,
      // ... other components would be calculated here
    }
  };
}

function calculateDarkEnergy(inputs: Record<string, any>) {
  // This would calculate the dark energy components
  // For simplicity, we're returning placeholder values
  
  return {
    darkEnergyComponents: {
      // Placeholder for dark energy components
      density: 0,
      // ... other components would be calculated here
    }
  };
}

function calculateDarkMatter(inputs: Record<string, any>) {
  // This would calculate the dark matter components
  // For simplicity, we're returning placeholder values
  
  return {
    darkMatterComponents: {
      // Placeholder for dark matter components
      density: 0,
      // ... other components would be calculated here
    }
  };
}

function calculateInflationModel(inputs: Record<string, any>) {
  // This would calculate the inflation model components
  // For simplicity, we're returning placeholder values
  
  return {
    inflationModelComponents: {
      // Placeholder for inflation model components
      scale_factor: 0,
      // ... other components would be calculated here
    }
  };
}

function calculateWormholeSolution(inputs: Record<string, any>) {
  // This would calculate the wormhole solution components
  // For simplicity, we're returning placeholder values
  
  return {
    wormholeComponents: {
      // Placeholder for wormhole components
      g_tt: 0,
      g_rr: 0,
      g_theta_theta: 0,
      g_phi_phi: 0
    }
  };
} 