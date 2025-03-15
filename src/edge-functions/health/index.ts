import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from '@supabase/supabase-js'
import { Redis } from 'https://deno.land/x/redis@v0.29.0/mod.ts'

interface HealthCheck {
  status: 'healthy' | 'unhealthy'
  message?: string
  timestamp: string
}

interface ServiceCheck {
  database: HealthCheck
  redis: HealthCheck
  edge_functions: HealthCheck
  memory: HealthCheck
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || ''
const REDIS_URL = Deno.env.get('REDIS_URL') || 'redis://localhost:6379'

async function checkDatabase(): Promise<HealthCheck> {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    const { data, error } = await supabase
      .from('health_checks')
      .select('id')
      .limit(1)
    
    if (error) throw error
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      message: error.message,
      timestamp: new Date().toISOString()
    }
  }
}

async function checkRedis(): Promise<HealthCheck> {
  try {
    const redis = await Redis.connect(REDIS_URL)
    await redis.ping()
    await redis.close()
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      message: error.message,
      timestamp: new Date().toISOString()
    }
  }
}

function checkMemory(): HealthCheck {
  const memoryUsage = Deno.memoryUsage()
  const usagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
  
  return {
    status: usagePercent < 85 ? 'healthy' : 'unhealthy',
    message: `Memory usage: ${usagePercent.toFixed(2)}%`,
    timestamp: new Date().toISOString()
  }
}

async function checkEdgeFunctions(): Promise<HealthCheck> {
  try {
    // Simple calculation to test edge function
    const result = await fetch(`${SUPABASE_URL}/functions/v1/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        type: 'schwarzschild',
        parameters: { mass: 1.0 }
      })
    })
    
    if (!result.ok) throw new Error(`HTTP ${result.status}`)
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      message: error.message,
      timestamp: new Date().toISOString()
    }
  }
}

serve(async (req) => {
  try {
    const checks: ServiceCheck = {
      database: await checkDatabase(),
      redis: await checkRedis(),
      edge_functions: await checkEdgeFunctions(),
      memory: checkMemory()
    }
    
    const isHealthy = Object.values(checks).every(
      check => check.status === 'healthy'
    )
    
    const response = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      checks,
      timestamp: new Date().toISOString()
    }
    
    return new Response(JSON.stringify(response, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Health-Check': isHealthy ? 'pass' : 'fail'
      },
      status: isHealthy ? 200 : 503
    })
  } catch (error) {
    return new Response(JSON.stringify({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    })
  }
}) 