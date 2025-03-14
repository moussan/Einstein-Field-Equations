-- Create schema for Einstein Field Equations Platform
-- This migration sets up the initial database schema for Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set up storage for user avatars and calculation results
CREATE SCHEMA IF NOT EXISTS storage;

-- Create enum types
CREATE TYPE calculation_type AS ENUM (
  'vacuum',
  'matter',
  'weak-field',
  'schwarzschild',
  'kerr',
  'reissner-nordstrom',
  'kerr-newman',
  'flrw',
  'christoffel',
  'geodesic',
  'ricci-tensor',
  'riemann-tensor',
  'weyl-tensor',
  'energy-conditions'
);

CREATE TYPE coordinate_system AS ENUM (
  'spherical',
  'cartesian',
  'cylindrical',
  'boyer-lindquist',
  'eddington-finkelstein',
  'kruskal-szekeres'
);

-- Create profiles table that extends the auth.users table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create calculations table
CREATE TABLE public.calculations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type calculation_type NOT NULL,
  description TEXT,
  inputs JSONB NOT NULL,
  results JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  calculation_time FLOAT,
  is_public BOOLEAN DEFAULT FALSE
);

-- Create index on calculation type for faster queries
CREATE INDEX idx_calculations_type ON public.calculations(type);
CREATE INDEX idx_calculations_user_id ON public.calculations(user_id);
CREATE INDEX idx_calculations_is_public ON public.calculations(is_public);

-- Create saved_visualizations table
CREATE TABLE public.saved_visualizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  visualization_type TEXT NOT NULL,
  parameters JSONB NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_public BOOLEAN DEFAULT FALSE
);

-- Create index on visualization user_id
CREATE INDEX idx_visualizations_user_id ON public.saved_visualizations(user_id);
CREATE INDEX idx_visualizations_is_public ON public.saved_visualizations(is_public);

-- Create user_preferences table
CREATE TABLE public.user_preferences (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  theme TEXT DEFAULT 'dark',
  default_coordinate_system coordinate_system DEFAULT 'spherical',
  notification_settings JSONB DEFAULT '{"email": true, "push": false}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Set up Row Level Security (RLS) policies

-- Profiles table policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Calculations table policies
ALTER TABLE public.calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own calculations"
  ON public.calculations FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert their own calculations"
  ON public.calculations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calculations"
  ON public.calculations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calculations"
  ON public.calculations FOR DELETE
  USING (auth.uid() = user_id);

-- Saved visualizations table policies
ALTER TABLE public.saved_visualizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own visualizations or public ones"
  ON public.saved_visualizations FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert their own visualizations"
  ON public.saved_visualizations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own visualizations"
  ON public.saved_visualizations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own visualizations"
  ON public.saved_visualizations FOR DELETE
  USING (auth.uid() = user_id);

-- User preferences table policies
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Create functions and triggers

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'avatar_url');
  
  INSERT INTO public.user_preferences (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calculations_updated_at
  BEFORE UPDATE ON public.calculations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_saved_visualizations_updated_at
  BEFORE UPDATE ON public.saved_visualizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Tables accessible to authenticated users
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.calculations TO authenticated;
GRANT ALL ON public.saved_visualizations TO authenticated;
GRANT ALL ON public.user_preferences TO authenticated;

-- Sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated; 