-- Create posting_events table for multi-event support in posting map
-- This enables managing multiple events with slug-based URL routing

-- ============================================
-- 1. Create posting_events table
-- ============================================
CREATE TABLE IF NOT EXISTS public.posting_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on slug for faster lookups
CREATE INDEX idx_posting_events_slug ON public.posting_events(slug);

-- Create index on is_active for faster active event lookup
CREATE INDEX idx_posting_events_is_active ON public.posting_events(is_active) WHERE is_active = true;

-- Create updated_at trigger for posting_events
CREATE TRIGGER update_posting_events_updated_at
  BEFORE UPDATE ON public.posting_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. Ensure only one event can be active at a time
-- ============================================
CREATE OR REPLACE FUNCTION ensure_single_active_event()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE public.posting_events
    SET is_active = false
    WHERE id != NEW.id AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_single_active_event
  BEFORE INSERT OR UPDATE ON public.posting_events
  FOR EACH ROW
  WHEN (NEW.is_active = true)
  EXECUTE FUNCTION ensure_single_active_event();

-- ============================================
-- 3. Add event_id column to posting_shapes
-- ============================================
ALTER TABLE public.posting_shapes
ADD COLUMN event_id UUID REFERENCES public.posting_events(id) ON DELETE CASCADE;

-- Create index for event_id lookups
CREATE INDEX idx_posting_shapes_event_id ON public.posting_shapes(event_id);

-- ============================================
-- 4. Insert default event and migrate existing data
-- ============================================
INSERT INTO public.posting_events (id, slug, title, description, is_active)
VALUES ('a0000000-0000-0000-0000-000000000001', 'default', 'デフォルトイベント', '初期イベント', true);

-- Migrate existing shapes to default event
UPDATE public.posting_shapes
SET event_id = (SELECT id FROM public.posting_events WHERE slug = 'default')
WHERE event_id IS NULL;

-- Make event_id NOT NULL after migration
ALTER TABLE public.posting_shapes
ALTER COLUMN event_id SET NOT NULL;

-- ============================================
-- 5. Grant permissions for posting_events
-- ============================================
GRANT SELECT ON public.posting_events TO anon;
GRANT SELECT ON public.posting_events TO authenticated;

-- ============================================
-- 6. Enable RLS on posting_events
-- ============================================
ALTER TABLE public.posting_events ENABLE ROW LEVEL SECURITY;

-- Allow all users to read events
CREATE POLICY "Allow read access to all users" ON public.posting_events
  FOR SELECT
  USING (true);
