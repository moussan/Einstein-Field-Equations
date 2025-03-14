-- Add indexes for improved query performance

-- Calculations table indexes
CREATE INDEX IF NOT EXISTS idx_calculations_user_id ON public.calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_calculations_type ON public.calculations(type);
CREATE INDEX IF NOT EXISTS idx_calculations_is_public ON public.calculations(is_public);
CREATE INDEX IF NOT EXISTS idx_calculations_created_at ON public.calculations(created_at DESC);

-- Saved visualizations table indexes
CREATE INDEX IF NOT EXISTS idx_visualizations_user_id ON public.saved_visualizations(user_id);
CREATE INDEX IF NOT EXISTS idx_visualizations_is_public ON public.saved_visualizations(is_public);
CREATE INDEX IF NOT EXISTS idx_visualizations_type ON public.saved_visualizations(visualization_type);
CREATE INDEX IF NOT EXISTS idx_visualizations_created_at ON public.saved_visualizations(created_at DESC);

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON public.profiles(display_name);

-- User preferences table indexes
CREATE INDEX IF NOT EXISTS idx_preferences_theme ON public.user_preferences(theme);
CREATE INDEX IF NOT EXISTS idx_preferences_coordinate_system ON public.user_preferences(default_coordinate_system);

-- Create database functions for optimized queries

-- Function to get recent public calculations with user info
CREATE OR REPLACE FUNCTION get_recent_public_calculations(limit_count INTEGER)
RETURNS TABLE (
  id UUID,
  type TEXT,
  inputs JSONB,
  results JSONB,
  user_display_name TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.type,
    c.inputs,
    c.results,
    p.display_name AS user_display_name,
    c.created_at
  FROM 
    calculations c
    JOIN profiles p ON c.user_id = p.id
  WHERE 
    c.is_public = true
  ORDER BY 
    c.created_at DESC
  LIMIT 
    limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's calculations with pagination
CREATE OR REPLACE FUNCTION get_user_calculations(
  user_uuid UUID,
  page_number INTEGER,
  page_size INTEGER
)
RETURNS TABLE (
  id UUID,
  type TEXT,
  inputs JSONB,
  results JSONB,
  is_public BOOLEAN,
  description TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  total_count BIGINT
) AS $$
DECLARE
  offset_val INTEGER;
  total_count BIGINT;
BEGIN
  -- Calculate offset
  offset_val := (page_number - 1) * page_size;
  
  -- Get total count
  SELECT COUNT(*) INTO total_count FROM calculations WHERE user_id = user_uuid;
  
  -- Return paginated results with total count
  RETURN QUERY
  SELECT 
    c.id,
    c.type,
    c.inputs,
    c.results,
    c.is_public,
    c.description,
    c.created_at,
    c.updated_at,
    total_count
  FROM 
    calculations c
  WHERE 
    c.user_id = user_uuid
  ORDER BY 
    c.created_at DESC
  LIMIT 
    page_size
  OFFSET 
    offset_val;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's visualizations with pagination
CREATE OR REPLACE FUNCTION get_user_visualizations(
  user_uuid UUID,
  page_number INTEGER,
  page_size INTEGER
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  visualization_type TEXT,
  parameters JSONB,
  thumbnail_url TEXT,
  is_public BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  total_count BIGINT
) AS $$
DECLARE
  offset_val INTEGER;
  total_count BIGINT;
BEGIN
  -- Calculate offset
  offset_val := (page_number - 1) * page_size;
  
  -- Get total count
  SELECT COUNT(*) INTO total_count FROM saved_visualizations WHERE user_id = user_uuid;
  
  -- Return paginated results with total count
  RETURN QUERY
  SELECT 
    v.id,
    v.title,
    v.description,
    v.visualization_type,
    v.parameters,
    v.thumbnail_url,
    v.is_public,
    v.created_at,
    v.updated_at,
    total_count
  FROM 
    saved_visualizations v
  WHERE 
    v.user_id = user_uuid
  ORDER BY 
    v.created_at DESC
  LIMIT 
    page_size
  OFFSET 
    offset_val;
END;
$$ LANGUAGE plpgsql;

-- Function to search calculations by type and keywords
CREATE OR REPLACE FUNCTION search_calculations(
  search_term TEXT,
  calculation_type TEXT DEFAULT NULL,
  is_public_only BOOLEAN DEFAULT true,
  user_uuid UUID DEFAULT NULL,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  type TEXT,
  inputs JSONB,
  description TEXT,
  user_display_name TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.type,
    c.inputs,
    c.description,
    p.display_name AS user_display_name,
    c.created_at
  FROM 
    calculations c
    JOIN profiles p ON c.user_id = p.id
  WHERE 
    (
      -- Match on description if provided
      c.description ILIKE '%' || search_term || '%'
      -- Or match on calculation type
      OR c.type ILIKE '%' || search_term || '%'
      -- Or match on JSON inputs (convert to text for search)
      OR c.inputs::TEXT ILIKE '%' || search_term || '%'
    )
    -- Filter by calculation type if provided
    AND (calculation_type IS NULL OR c.type = calculation_type)
    -- Filter by public/private
    AND (
      is_public_only = false 
      OR c.is_public = true 
      OR c.user_id = user_uuid
    )
    -- Filter by user if provided
    AND (user_uuid IS NULL OR c.user_id = user_uuid OR c.is_public = true)
  ORDER BY 
    c.created_at DESC
  LIMIT 
    limit_count;
END;
$$ LANGUAGE plpgsql; 