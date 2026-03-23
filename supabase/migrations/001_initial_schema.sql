-- Excalicord Database Schema
-- Phase 1: Initial Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES TABLE
-- Extended user information
-- =============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  stripe_customer_id TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'team')),
  subscription_status TEXT DEFAULT 'active',
  storage_used_bytes BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- =============================================
-- PROJECTS TABLE
-- Video recording projects
-- =============================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Project',
  description TEXT,
  thumbnail_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  published_slug TEXT UNIQUE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own projects"
  ON projects FOR ALL
  USING (auth.uid() = owner_id);

CREATE POLICY "Anyone can view published projects"
  ON projects FOR SELECT
  USING (is_published = TRUE);

-- =============================================
-- SLIDES TABLE
-- Individual slides within a project
-- =============================================
CREATE TABLE slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  content JSONB NOT NULL DEFAULT '{}',
  slide_type TEXT DEFAULT 'slide' CHECK (slide_type IN ('slide', 'section')),
  background_style JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for slides
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD slides in own projects"
  ON slides FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = slides.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- =============================================
-- EXPORTS TABLE
-- Video export records
-- =============================================
CREATE TABLE exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  export_type TEXT NOT NULL CHECK (export_type IN ('mp4', 'webm', 'gif')),
  storage_path TEXT,
  download_url TEXT,
  file_size_bytes BIGINT,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for exports
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exports"
  ON exports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own exports"
  ON exports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- SUBSCRIPTION QUOTAS TABLE
-- Subscription tier quotas
-- =============================================
CREATE TABLE subscription_quotas (
  tier TEXT PRIMARY KEY CHECK (tier IN ('free', 'pro', 'team')),
  monthly_price_cents INTEGER NOT NULL,
  recording_minutes_limit INTEGER NOT NULL,
  export_count_limit INTEGER NOT NULL,
  storage_bytes_limit BIGINT NOT NULL,
  team_members_limit INTEGER NOT NULL,
  features JSONB NOT NULL DEFAULT '{}'
);

-- Insert default quotas
INSERT INTO subscription_quotas (tier, monthly_price_cents, recording_minutes_limit, export_count_limit, storage_bytes_limit, team_members_limit, features) VALUES
('free', 0, 30, 5, 1073741824, 1, '{"ai_avatars": false, "custom_branding": false, "priority_processing": false}'),
('pro', 1900, 300, 50, 10737418240, 1, '{"ai_avatars": true, "custom_branding": false, "priority_processing": false}'),
('team', 4900, 1000, 200, 107374182400, 10, '{"ai_avatars": true, "custom_branding": true, "priority_processing": true}');

-- =============================================
-- USAGE RECORDS TABLE
-- Usage tracking for billing
-- =============================================
CREATE TABLE usage_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  usage_type TEXT NOT NULL CHECK (usage_type IN ('recording_minutes', 'export_count', 'storage_bytes')),
  amount INTEGER NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for usage_records
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON usage_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert usage records"
  ON usage_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- INDEXES
-- Performance optimization
-- =============================================
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_slides_project_id ON slides(project_id);
CREATE INDEX idx_slides_position ON slides(project_id, position);
CREATE INDEX idx_exports_user_id ON exports(user_id);
CREATE INDEX idx_exports_status ON exports(status);
CREATE INDEX idx_usage_records_user_period ON usage_records(user_id, period_start, period_end);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_slides_updated_at
  BEFORE UPDATE ON slides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
