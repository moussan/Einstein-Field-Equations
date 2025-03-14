import supabase from './supabase';

// Get all calculations for the current user
export const getUserCalculations = async (page = 1, pageSize = 10) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error, count } = await supabase
    .from('calculations')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(start, end);

  return { data, error, count, page, pageSize };
};

// Get public calculations
export const getPublicCalculations = async (page = 1, pageSize = 10) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error, count } = await supabase
    .from('calculations')
    .select('*, profiles(display_name)', { count: 'exact' })
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .range(start, end);

  return { data, error, count, page, pageSize };
};

// Get a specific calculation by ID
export const getCalculation = async (id) => {
  const { data, error } = await supabase
    .from('calculations')
    .select('*, profiles(display_name)')
    .eq('id', id)
    .single();

  return { data, error };
};

// Create a new calculation
export const createCalculation = async (calculationData) => {
  const { data, error } = await supabase
    .from('calculations')
    .insert(calculationData)
    .select()
    .single();

  return { data, error };
};

// Update an existing calculation
export const updateCalculation = async (id, updates) => {
  const { data, error } = await supabase
    .from('calculations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

// Delete a calculation
export const deleteCalculation = async (id) => {
  const { error } = await supabase
    .from('calculations')
    .delete()
    .eq('id', id);

  return { error };
};

// Search calculations by type or description
export const searchCalculations = async (query, page = 1, pageSize = 10) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error, count } = await supabase
    .from('calculations')
    .select('*', { count: 'exact' })
    .or(`type.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .range(start, end);

  return { data, error, count, page, pageSize };
};

// Filter calculations by type
export const filterCalculationsByType = async (type, page = 1, pageSize = 10) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error, count } = await supabase
    .from('calculations')
    .select('*', { count: 'exact' })
    .eq('type', type)
    .order('created_at', { ascending: false })
    .range(start, end);

  return { data, error, count, page, pageSize };
};

// Perform a calculation (this would typically call a serverless function)
export const performCalculation = async (calculationType, inputs) => {
  // In a real implementation, this would call a Supabase Edge Function
  // For now, we'll simulate a calculation
  
  // Create a record of the calculation
  const calculationRecord = {
    type: calculationType,
    inputs: inputs,
    is_public: false,
  };
  
  const { data: createdCalculation, error: creationError } = await createCalculation(calculationRecord);
  
  if (creationError) {
    return { data: null, error: creationError };
  }
  
  // Simulate calculation processing
  // In a real implementation, this would be done in a serverless function
  const results = simulateCalculation(calculationType, inputs);
  
  // Update the calculation with results
  const { data, error } = await updateCalculation(createdCalculation.id, {
    results: results,
    calculation_time: 0.5, // Simulated calculation time
  });
  
  return { data, error };
};

// Helper function to simulate calculation results
const simulateCalculation = (type, inputs) => {
  // This is a simplified simulation
  // In a real implementation, this would be complex mathematical calculations
  
  switch (type) {
    case 'schwarzschild':
      const { mass, radius } = inputs;
      const G = 6.67430e-11; // Gravitational constant
      const c = 299792458; // Speed of light
      
      // Schwarzschild metric components
      const g_tt = -(1 - (2 * G * mass) / (c * c * radius));
      const g_rr = 1 / (1 - (2 * G * mass) / (c * c * radius));
      const g_theta_theta = radius * radius;
      const g_phi_phi = radius * radius * Math.sin(inputs.theta) * Math.sin(inputs.theta);
      
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
      
    case 'kerr':
      // Simplified Kerr metric calculation
      return {
        metricComponents: {
          g_tt: -0.8,
          g_rr: 1.2,
          g_theta_theta: inputs.radius * inputs.radius,
          g_phi_phi: inputs.radius * inputs.radius * Math.sin(inputs.theta) * Math.sin(inputs.theta)
        },
        ricciscalar: 0.05,
        eventHorizon: inputs.mass * 2
      };
      
    case 'flrw':
      // FLRW metric (simplified)
      return {
        metricComponents: {
          g_tt: -1,
          g_rr: inputs.radius * inputs.radius,
          g_theta_theta: inputs.radius * inputs.radius,
          g_phi_phi: inputs.radius * inputs.radius * Math.sin(inputs.theta) * Math.sin(inputs.theta)
        },
        ricciscalar: 0.1,
        hubbleParameter: 70 // km/s/Mpc
      };
      
    default:
      return {
        error: 'Unsupported calculation type'
      };
  }
}; 