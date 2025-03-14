-- Create materialized views for frequently accessed data

-- Materialized view for recent public calculations with user info
CREATE MATERIALIZED VIEW IF NOT EXISTS public_calculations_view AS
SELECT 
  c.id,
  c.type,
  c.inputs,
  c.results,
  c.description,
  c.created_at,
  c.updated_at,
  p.display_name,
  p.avatar_url
FROM 
  calculations c
  JOIN profiles p ON c.user_id = p.id
WHERE 
  c.is_public = true
ORDER BY 
  c.created_at DESC
LIMIT 100;

-- Create unique index for faster refreshes
CREATE UNIQUE INDEX IF NOT EXISTS idx_public_calculations_view ON public_calculations_view(id);

-- Materialized view for calculation statistics by type
CREATE MATERIALIZED VIEW IF NOT EXISTS calculation_stats_view AS
SELECT 
  type,
  COUNT(*) as count,
  AVG(calculation_time) as avg_calculation_time,
  MIN(calculation_time) as min_calculation_time,
  MAX(calculation_time) as max_calculation_time,
  COUNT(DISTINCT user_id) as unique_users
FROM 
  calculations
GROUP BY 
  type;

-- Create unique index for faster refreshes
CREATE UNIQUE INDEX IF NOT EXISTS idx_calculation_stats_view ON calculation_stats_view(type);

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public_calculations_view;
  REFRESH MATERIALIZED VIEW CONCURRENTLY calculation_stats_view;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger function to refresh views when calculations change
CREATE OR REPLACE FUNCTION refresh_views_on_calculation_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only refresh if the calculation is public or its public status changed
  IF (NEW.is_public = true OR OLD.is_public != NEW.is_public) THEN
    -- Use pg_notify to trigger an asynchronous refresh
    -- This prevents blocking the transaction
    PERFORM pg_notify('refresh_views', 'calculations_changed');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger on the calculations table
DROP TRIGGER IF EXISTS trigger_refresh_views_on_calculation_change ON calculations;
CREATE TRIGGER trigger_refresh_views_on_calculation_change
AFTER INSERT OR UPDATE OR DELETE ON calculations
FOR EACH ROW
EXECUTE FUNCTION refresh_views_on_calculation_change();

-- Create a scheduled function to refresh views periodically
-- This ensures views are refreshed even if the trigger-based approach fails
CREATE OR REPLACE FUNCTION schedule_refresh_materialized_views()
RETURNS void AS $$
BEGIN
  -- Refresh views every hour
  PERFORM refresh_materialized_views();
END;
$$ LANGUAGE plpgsql;

-- Set up a cron job to refresh views (requires pg_cron extension)
-- Uncomment if pg_cron is available
-- SELECT cron.schedule('0 * * * *', 'SELECT schedule_refresh_materialized_views()');

-- Create a function to get recent public calculations from the materialized view
CREATE OR REPLACE FUNCTION get_recent_public_calculations_cached(limit_count INTEGER)
RETURNS TABLE (
  id UUID,
  type TEXT,
  inputs JSONB,
  results JSONB,
  description TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  display_name TEXT,
  avatar_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.type,
    v.inputs,
    v.results,
    v.description,
    v.created_at,
    v.updated_at,
    v.display_name,
    v.avatar_url
  FROM 
    public_calculations_view v
  LIMIT 
    limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get calculation statistics
CREATE OR REPLACE FUNCTION get_calculation_stats(calc_type TEXT DEFAULT NULL)
RETURNS TABLE (
  type TEXT,
  count BIGINT,
  avg_calculation_time FLOAT,
  min_calculation_time FLOAT,
  max_calculation_time FLOAT,
  unique_users BIGINT
) AS $$
BEGIN
  IF calc_type IS NULL THEN
    RETURN QUERY
    SELECT * FROM calculation_stats_view;
  ELSE
    RETURN QUERY
    SELECT * FROM calculation_stats_view WHERE type = calc_type;
  END IF;
END;
$$ LANGUAGE plpgsql; 