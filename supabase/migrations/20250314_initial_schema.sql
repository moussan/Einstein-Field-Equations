-- Create schema for Einstein Field Equations Platform
-- This migration sets up the initial database schema for Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set up storage for user avatars and calculation results
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('visualizations', 'visualizations', true);

-- Create enum types
CREATE TYPE calculation_type AS ENUM (
  'schwarzschild', 
  'kerr', 
  'flrw', 
  'christoffel_symbols', 
  'ricci_tensor', 
  'riemann_tensor'
);

CREATE TYPE coordinate_system AS ENUM (
  'cartesian', 
  'spherical', 
  'cylindrical'
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  website TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create calculations table
CREATE TABLE public.calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type calculation_type NOT NULL,
  inputs JSONB NOT NULL,
  results JSONB,
  calculation_time FLOAT,
  is_public BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create saved visualizations table
CREATE TABLE public.saved_visualizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  visualization_type TEXT NOT NULL,
  parameters JSONB NOT NULL,
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user preferences table
CREATE TABLE public.user_preferences (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  default_coordinate_system coordinate_system DEFAULT 'cartesian',
  theme TEXT DEFAULT 'light',
  visualization_settings JSONB DEFAULT '{}'::jsonb,
  notification_settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX idx_calculations_user_id ON public.calculations(user_id);
CREATE INDEX idx_calculations_type ON public.calculations(type);
CREATE INDEX idx_calculations_is_public ON public.calculations(is_public);
CREATE INDEX idx_visualizations_user_id ON public.saved_visualizations(user_id);
CREATE INDEX idx_visualizations_is_public ON public.saved_visualizations(is_public);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_timestamp
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_calculations_timestamp
  BEFORE UPDATE ON public.calculations
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_visualizations_timestamp
  BEFORE UPDATE ON public.saved_visualizations
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_user_preferences_timestamp
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- Set up Row Level Security (RLS)
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_visualizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Calculations policies
CREATE POLICY "Users can view their own calculations"
  ON public.calculations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public calculations"
  ON public.calculations FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can insert their own calculations"
  ON public.calculations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calculations"
  ON public.calculations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calculations"
  ON public.calculations FOR DELETE
  USING (auth.uid() = user_id);

-- Saved visualizations policies
CREATE POLICY "Users can view their own visualizations"
  ON public.saved_visualizations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public visualizations"
  ON public.saved_visualizations FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can insert their own visualizations"
  ON public.saved_visualizations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own visualizations"
  ON public.saved_visualizations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own visualizations"
  ON public.saved_visualizations FOR DELETE
  USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant permissions on tables
GRANT SELECT ON public.profiles TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated, service_role;

GRANT SELECT ON public.calculations TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calculations TO authenticated, service_role;

GRANT SELECT ON public.saved_visualizations TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_visualizations TO authenticated, service_role;

GRANT SELECT ON public.user_preferences TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_preferences TO authenticated, service_role;

-- Grant permissions on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role; 