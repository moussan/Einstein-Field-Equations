import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  error?: string;
  details?: Record<string, unknown>;
}

serve(async (req: Request) => {
  const start = performance.now();
  
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
    // Check database connection
    const dbStatus = await checkDatabase();
    
    // Check edge functions
    const edgeFunctionsStatus = await checkEdgeFunctions();
    
    // Check storage
    const storageStatus = await checkStorage();
    
    // Overall status is healthy only if all components are healthy
    const overallStatus = 
      dbStatus.status === 'healthy' && 
      edgeFunctionsStatus.status === 'healthy' && 
      storageStatus.status === 'healthy' 
        ? 'healthy' 
        : 'unhealthy';
    
    const responseTime = performance.now() - start;
    
    return new Response(
      JSON.stringify({
        status: overallStatus,
        responseTime: `${responseTime.toFixed(2)}ms`,
        timestamp: new Date().toISOString(),
        components: {
          database: dbStatus,
          edgeFunctions: edgeFunctionsStatus,
          storage: storageStatus
        }
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
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

async function checkDatabase(): Promise<HealthStatus> {
  try {
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      return { 
        status: 'unhealthy', 
        error: 'Missing Supabase credentials' 
      };
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Simple query to check database connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      return { 
        status: 'unhealthy', 
        error: error.message,
        details: { code: error.code }
      };
    }
    
    return { 
      status: 'healthy',
      details: { query_time: performance.now() }
    };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error.message || 'Unknown database error'
    };
  }
}

async function checkEdgeFunctions(): Promise<HealthStatus> {
  try {
    // Check if the calculate function is available
    const calculateUrl = Deno.env.get('SUPABASE_URL') 
      ? `${Deno.env.get('SUPABASE_URL')}/functions/v1/calculate`
      : '';
    
    if (!calculateUrl) {
      return { 
        status: 'unhealthy', 
        error: 'Missing Edge Function URL' 
      };
    }
    
    // Just check if the function responds, don't actually run a calculation
    const response = await fetch(calculateUrl, {
      method: 'OPTIONS',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // If we get a 204 response, the function is available
    if (response.status === 204) {
      return { 
        status: 'healthy',
        details: { status_code: response.status }
      };
    }
    
    return { 
      status: 'unhealthy', 
      error: `Edge Function returned status ${response.status}`,
      details: { status_code: response.status }
    };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error.message || 'Unknown Edge Function error'
    };
  }
}

async function checkStorage(): Promise<HealthStatus> {
  try {
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      return { 
        status: 'unhealthy', 
        error: 'Missing Supabase credentials' 
      };
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check if storage buckets are accessible
    const { data, error } = await supabase
      .storage
      .listBuckets();
    
    if (error) {
      return { 
        status: 'unhealthy', 
        error: error.message,
        details: { code: error.code }
      };
    }
    
    return { 
      status: 'healthy',
      details: { buckets_count: data?.length || 0 }
    };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error.message || 'Unknown storage error'
    };
  }
} 