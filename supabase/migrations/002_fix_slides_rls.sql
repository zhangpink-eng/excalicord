-- Migration: Fix slides RLS policies
-- This ensures users can only modify slides in projects they own

-- Drop existing slides policies if they exist
DROP POLICY IF EXISTS "Users can CRUD slides in own projects" ON slides;

-- Create a more explicit policy for slides
CREATE POLICY "Users can CRUD slides in own projects"
  ON slides FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = slides.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Also ensure projects policy is correct
DROP POLICY IF EXISTS "Users can CRUD own projects" ON projects;

CREATE POLICY "Users can CRUD own projects"
  ON projects FOR ALL
  USING (auth.uid() = owner_id);

-- Verify RLS is enabled
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
