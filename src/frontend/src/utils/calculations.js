import supabase from './supabase';
import { apiCache, withPerformanceTracking, createCachedRequest } from './performance';

/**
 * Get user's calculations with pagination
 * @param {number} page - Page number (starting from 1)
 * @param {number} pageSize - Number of items per page
 * @returns {Promise<Object>} - Paginated calculations with count
 */
export const getUserCalculations = withPerformanceTracking(
  'get_user_calculations',
  async (page = 1, pageSize = 10) => {
    // Calculate range for pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    // Use the optimized database function if available
    try {
      const { data, error } = await supabase.rpc(
        'get_user_calculations',
        { 
          user_uuid: supabase.auth.user()?.id,
          page_number: page,
          page_size: pageSize
        }
      );
      
      if (!error && data && data.length > 0) {
        // Extract total count from the first row
        const totalCount = data[0]?.total_count || 0;
        
        return {
          data,
          error: null,
          count: totalCount,
          page,
          pageSize
        };
      }
    } catch (e) {
      // Fall back to standard query if RPC fails
      console.warn('Falling back to standard query for getUserCalculations', e);
    }
    
    // Standard query as fallback
    const { data, error, count } = await supabase
      .from('calculations')
      .select('id, type, inputs, results, is_public, description, created_at, updated_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    
    return {
      data,
      error,
      count,
      page,
      pageSize
    };
  }
);

/**
 * Get public calculations with pagination
 * @param {number} page - Page number (starting from 1)
 * @param {number} pageSize - Number of items per page
 * @returns {Promise<Object>} - Paginated public calculations with count
 */
export const getPublicCalculations = withPerformanceTracking(
  'get_public_calculations',
  async (page = 1, pageSize = 10) => {
    // Calculate range for pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    // Try to get from cache first
    const cacheKey = `public_calculations_${page}_${pageSize}`;
    const cachedResult = apiCache.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }
    
    // Use the optimized database function if available
    try {
      const { data, error } = await supabase.rpc(
        'get_recent_public_calculations',
        { limit_count: pageSize }
      );
      
      if (!error && data) {
        const result = {
          data,
          error: null,
          count: data.length, // We don't have exact count from this function
          page,
          pageSize
        };
        
        // Cache the result for 1 minute
        apiCache.set(cacheKey, result, 60 * 1000);
        return result;
      }
    } catch (e) {
      // Fall back to standard query if RPC fails
      console.warn('Falling back to standard query for getPublicCalculations', e);
    }
    
    // Standard query as fallback
    const { data, error, count } = await supabase
      .from('calculations')
      .select('id, type, inputs, results, created_at, profiles(display_name)', { count: 'exact' })
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(from, to);
    
    const result = {
      data,
      error,
      count,
      page,
      pageSize
    };
    
    // Cache the result for 1 minute
    if (!error) {
      apiCache.set(cacheKey, result, 60 * 1000);
    }
    
    return result;
  }
);

/**
 * Get a specific calculation by ID
 * @param {string} id - Calculation ID
 * @returns {Promise<Object>} - Calculation data
 */
export const getCalculation = createCachedRequest(
  async (id) => {
    const { data, error } = await supabase
      .from('calculations')
      .select('*, profiles(display_name)')
      .eq('id', id)
      .single();
    
    return { data, error };
  },
  (id) => `calculation_${id}`,
  5 * 60 * 1000 // Cache for 5 minutes
);

/**
 * Create a new calculation
 * @param {Object} calculationData - Calculation data
 * @returns {Promise<Object>} - Created calculation
 */
export const createCalculation = withPerformanceTracking(
  'create_calculation',
  async (calculationData) => {
    const { data, error } = await supabase
      .from('calculations')
      .insert(calculationData)
      .select()
      .single();
    
    return { data, error };
  }
);

/**
 * Update an existing calculation
 * @param {string} id - Calculation ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} - Updated calculation
 */
export const updateCalculation = withPerformanceTracking(
  'update_calculation',
  async (id, updates) => {
    const { data, error } = await supabase
      .from('calculations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    // Clear cache for this calculation
    if (!error) {
      apiCache.clear(`calculation_${id}`);
    }
    
    return { data, error };
  }
);

/**
 * Delete a calculation
 * @param {string} id - Calculation ID
 * @returns {Promise<Object>} - Result
 */
export const deleteCalculation = withPerformanceTracking(
  'delete_calculation',
  async (id) => {
    const { error } = await supabase
      .from('calculations')
      .delete()
      .eq('id', id);
    
    // Clear cache for this calculation
    apiCache.clear(`calculation_${id}`);
    
    return { error };
  }
);

/**
 * Perform a calculation and store the results
 * @param {string} type - Calculation type
 * @param {Object} inputs - Calculation inputs
 * @param {boolean} isPublic - Whether the calculation is public
 * @param {string} description - Optional description
 * @returns {Promise<Object>} - Calculation results
 */
export const performCalculation = withPerformanceTracking(
  'perform_calculation',
  async (type, inputs, isPublic = false, description = '') => {
    try {
      // First create a calculation record
      const { data: calculation, error: createError } = await createCalculation({
        type,
        inputs,
        is_public: isPublic,
        description
      });
      
      if (createError) {
        return { data: null, error: createError };
      }
      
      // Then call the Edge Function to perform the calculation
      const { data: edgeFunctionResult, error: edgeFunctionError } = await supabase.functions.invoke(
        'calculate',
        {
          body: { 
            type, 
            inputs,
            include_all_components: true // Request all components
          }
        }
      );
      
      if (edgeFunctionError) {
        return { data: null, error: edgeFunctionError };
      }
      
      // Update the calculation with the results
      const { data: updatedCalculation, error: updateError } = await updateCalculation(
        calculation.id,
        {
          results: edgeFunctionResult.results,
          calculation_time: edgeFunctionResult.calculation_time
        }
      );
      
      if (updateError) {
        return { data: null, error: updateError };
      }
      
      return { data: updatedCalculation, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }
);

/**
 * Search calculations by type and keywords
 * @param {string} searchTerm - Search term
 * @param {string} calculationType - Optional calculation type filter
 * @param {boolean} publicOnly - Whether to search only public calculations
 * @returns {Promise<Object>} - Search results
 */
export const searchCalculations = withPerformanceTracking(
  'search_calculations',
  async (searchTerm, calculationType = null, publicOnly = true) => {
    try {
      // Use the optimized database function
      const { data, error } = await supabase.rpc(
        'search_calculations',
        { 
          search_term: searchTerm,
          calculation_type: calculationType,
          is_public_only: publicOnly,
          user_uuid: supabase.auth.user()?.id,
          limit_count: 20
        }
      );
      
      return { data, error };
    } catch (e) {
      // Fall back to standard query if RPC fails
      console.warn('Falling back to standard query for searchCalculations', e);
      
      // Build query
      let query = supabase
        .from('calculations')
        .select('id, type, inputs, description, created_at, profiles(display_name)')
        .or(`description.ilike.%${searchTerm}%,type.ilike.%${searchTerm}%`);
      
      // Add type filter if provided
      if (calculationType) {
        query = query.eq('type', calculationType);
      }
      
      // Add public/private filter
      if (publicOnly) {
        query = query.eq('is_public', true);
      } else {
        // Include user's private calculations
        const userId = supabase.auth.user()?.id;
        if (userId) {
          query = query.or(`is_public.eq.true,user_id.eq.${userId}`);
        } else {
          query = query.eq('is_public', true);
        }
      }
      
      // Execute query
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(20);
      
      return { data, error };
    }
  }
);

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

// Utility functions for making calculations

/**
 * Calculate Schwarzschild metric
 */
export const calculateSchwarzschildMetric = async (mass, r) => {
    try {
        const response = await fetch('/api/metrics/schwarzschild', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mass, r })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        
        return { data, error: null };
    } catch (error) {
        return { data: null, error };
    }
};

/**
 * Calculate Kerr metric
 */
export const calculateKerrMetric = async (mass, a, r, theta) => {
    try {
        const response = await fetch('/api/metrics/kerr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mass, a, r, theta })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        
        return { data, error: null };
    } catch (error) {
        return { data: null, error };
    }
};

/**
 * Calculate Reissner-Nordström metric
 */
export const calculateReissnerNordstromMetric = async (mass, charge, r) => {
    try {
        const response = await fetch('/api/metrics/reissner-nordstrom', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mass, charge, r })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        
        return { data, error: null };
    } catch (error) {
        return { data: null, error };
    }
};

/**
 * Get cache statistics
 */
export const getCacheStats = async () => {
    try {
        const response = await fetch('/api/cache/stats');
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        
        return { data, error: null };
    } catch (error) {
        return { data: null, error };
    }
};

/**
 * Clear cache
 */
export const clearCache = async () => {
    try {
        const response = await fetch('/api/cache/clear', { method: 'POST' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        
        return { data, error: null };
    } catch (error) {
        return { data: null, error };
    }
}; 