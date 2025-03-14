import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  error?: string;
  details?: Record<string, unknown>;
}

// Cache for Supabase client to avoid recreating it on every request
let supabaseClient: any = null;

// Cache health check results to reduce load on backend services
const healthCache = {
  database: { status: null as HealthStatus | null, timestamp: 0 },
  edgeFunctions: { status: null as HealthStatus | null, timestamp: 0 },
  storage: { status: null as HealthStatus | null, timestamp: 0 }
};

// Cache TTL in milliseconds (30 seconds)
const CACHE_TTL = 30000;

// Get or create Supabase client
function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }
  
  supabaseClient = createClient(supabaseUrl, supabaseKey);
  return supabaseClient;
}

serve(async (req: Request) => {
  const start = performance.now();
  
  // CORS headers for preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'max-age=60' // Cache preflight for 60 seconds
      },
    });
  }
  
  // Only allow GET requests
  if (req.method !== 'GET') {
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
    // Parse URL to check for specific component checks
    const url = new URL(req.url);
    const component = url.searchParams.get('component');
    
    // Check if we should force refresh the cache
    const forceRefresh = url.searchParams.get('refresh') === 'true';
    
    let dbStatus: HealthStatus;
    let edgeFunctionsStatus: HealthStatus;
    let storageStatus: HealthStatus;
    
    // Perform checks based on requested component or all components
    if (component === 'database') {
      dbStatus = await checkDatabaseHealth(forceRefresh);
      edgeFunctionsStatus = { status: 'healthy' }; // Skip check
      storageStatus = { status: 'healthy' }; // Skip check
    } else if (component === 'edge-functions') {
      dbStatus = { status: 'healthy' }; // Skip check
      edgeFunctionsStatus = await checkEdgeFunctionsHealth(forceRefresh);
      storageStatus = { status: 'healthy' }; // Skip check
    } else if (component === 'storage') {
      dbStatus = { status: 'healthy' }; // Skip check
      edgeFunctionsStatus = { status: 'healthy' }; // Skip check
      storageStatus = await checkStorageHealth(forceRefresh);
    } else {
      // Check all components in parallel for better performance
      [dbStatus, edgeFunctionsStatus, storageStatus] = await Promise.all([
        checkDatabaseHealth(forceRefresh),
        checkEdgeFunctionsHealth(forceRefresh),
        checkStorageHealth(forceRefresh)
      ]);
    }
    
    // Overall status is healthy only if all components are healthy
    const overallStatus = 
      dbStatus.status === 'healthy' && 
      edgeFunctionsStatus.status === 'healthy' && 
      storageStatus.status === 'healthy' 
        ? 'healthy' 
        : 'unhealthy';
    
    const responseTime = performance.now() - start;
    
    // Prepare response with only the requested components
    const components: Record<string, HealthStatus> = {};
    
    if (component === 'database' || !component) {
      components.database = dbStatus;
    }
    
    if (component === 'edge-functions' || !component) {
      components.edgeFunctions = edgeFunctionsStatus;
    }
    
    if (component === 'storage' || !component) {
      components.storage = storageStatus;
    }
    
    return new Response(
      JSON.stringify({
        status: overallStatus,
        responseTime: `${responseTime.toFixed(2)}ms`,
        timestamp: new Date().toISOString(),
        components
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'max-age=30' // Cache for 30 seconds
        } 
      }
    );
  } catch (error) {
    const responseTime = performance.now() - start;
    
    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        responseTime: `${responseTime.toFixed(2)}ms`,
        timestamp: new Date().toISOString(),
        error: error.message || 'Unknown error occurred',
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      }
    );
  }
});

async function checkDatabaseHealth(forceRefresh = false): Promise<HealthStatus> {
  // Return cached result if available and not expired
  const now = Date.now();
  if (!forceRefresh && 
      healthCache.database.status && 
      now - healthCache.database.timestamp < CACHE_TTL) {
    return healthCache.database.status;
  }
  
  try {
    // Get Supabase client
    const supabase = getSupabaseClient();
    
    // Simple query to check database connection - use count for efficiency
    const startQuery = performance.now();
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    const queryTime = performance.now() - startQuery;
    
    if (error) {
      const status = { 
        status: 'unhealthy' as const, 
        error: error.message,
        details: { code: error.code }
      };
      
      // Update cache
      healthCache.database = { status, timestamp: now };
      return status;
    }
    
    const status = { 
      status: 'healthy' as const,
      details: { query_time_ms: queryTime.toFixed(2) }
    };
    
    // Update cache
    healthCache.database = { status, timestamp: now };
    return status;
  } catch (error) {
    const status = { 
      status: 'unhealthy' as const, 
      error: error.message || 'Unknown database error'
    };
    
    // Update cache
    healthCache.database = { status, timestamp: now };
    return status;
  }
}

async function checkEdgeFunctionsHealth(forceRefresh = false): Promise<HealthStatus> {
  // Return cached result if available and not expired
  const now = Date.now();
  if (!forceRefresh && 
      healthCache.edgeFunctions.status && 
      now - healthCache.edgeFunctions.timestamp < CACHE_TTL) {
    return healthCache.edgeFunctions.status;
  }
  
  try {
    // Check if the calculate function is available
    const calculateUrl = Deno.env.get('SUPABASE_URL') 
      ? `${Deno.env.get('SUPABASE_URL')}/functions/v1/calculate`
      : '';
    
    if (!calculateUrl) {
      const status = { 
        status: 'unhealthy' as const, 
        error: 'Missing Edge Function URL' 
      };
      
      // Update cache
      healthCache.edgeFunctions = { status, timestamp: now };
      return status;
    }
    
    // Use OPTIONS request for efficiency - just checking if the endpoint responds
    const startQuery = performance.now();
    const response = await fetch(calculateUrl, {
      method: 'OPTIONS',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const responseTime = performance.now() - startQuery;
    
    // If we get a 204 response, the function is available
    if (response.status === 204) {
      const status = { 
        status: 'healthy' as const,
        details: { 
          status_code: response.status,
          response_time_ms: responseTime.toFixed(2)
        }
      };
      
      // Update cache
      healthCache.edgeFunctions = { status, timestamp: now };
      return status;
    }
    
    const status = { 
      status: 'unhealthy' as const, 
      error: `Edge Function returned status ${response.status}`,
      details: { 
        status_code: response.status,
        response_time_ms: responseTime.toFixed(2)
      }
    };
    
    // Update cache
    healthCache.edgeFunctions = { status, timestamp: now };
    return status;
  } catch (error) {
    const status = { 
      status: 'unhealthy' as const, 
      error: error.message || 'Unknown Edge Function error'
    };
    
    // Update cache
    healthCache.edgeFunctions = { status, timestamp: now };
    return status;
  }
}

async function checkStorageHealth(forceRefresh = false): Promise<HealthStatus> {
  // Return cached result if available and not expired
  const now = Date.now();
  if (!forceRefresh && 
      healthCache.storage.status && 
      now - healthCache.storage.timestamp < CACHE_TTL) {
    return healthCache.storage.status;
  }
  
  try {
    // Get Supabase client
    const supabase = getSupabaseClient();
    
    // Check if storage buckets are accessible - just list buckets, don't fetch contents
    const startQuery = performance.now();
    const { data, error } = await supabase
      .storage
      .listBuckets();
    
    const queryTime = performance.now() - startQuery;
    
    if (error) {
      const status = { 
        status: 'unhealthy' as const, 
        error: error.message,
        details: { code: error.code }
      };
      
      // Update cache
      healthCache.storage = { status, timestamp: now };
      return status;
    }
    
    const status = { 
      status: 'healthy' as const,
      details: { 
        buckets_count: data?.length || 0,
        query_time_ms: queryTime.toFixed(2)
      }
    };
    
    // Update cache
    healthCache.storage = { status, timestamp: now };
    return status;
  } catch (error) {
    const status = { 
      status: 'unhealthy' as const, 
      error: error.message || 'Unknown storage error'
    };
    
    // Update cache
    healthCache.storage = { status, timestamp: now };
    return status;
  }
} 