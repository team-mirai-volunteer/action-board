-- Create posting_shapes table for map drawing functionality
-- Schema matches the required format for CSV import compatibility
CREATE TABLE IF NOT EXISTS public.posting_shapes (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('polygon', 'text')),
  coordinates JSONB NOT NULL,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on created_at for faster queries
CREATE INDEX idx_posting_shapes_created_at ON public.posting_shapes(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_posting_shapes_updated_at
  BEFORE UPDATE ON public.posting_shapes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posting_shapes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posting_shapes TO authenticated;