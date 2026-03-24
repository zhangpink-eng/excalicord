-- Add name column to slides table for slide rename feature
ALTER TABLE slides ADD COLUMN IF NOT EXISTS name TEXT DEFAULT '';

-- Set default names for existing slides
UPDATE slides SET name = 'Slide ' || (position + 1) WHERE name = '' OR name IS NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_slides_name ON slides(name);

-- Note: RLS policies already allow users to update their own slides via 002_fix_slides_rls migration