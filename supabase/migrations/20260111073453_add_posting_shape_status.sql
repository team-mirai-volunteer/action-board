-- Add status management to posting_shapes table
-- Status types: planned (配布予定), completed (配布完了), unavailable (配布不可), other (その他)
-- posting_count is required only when status is 'completed'

-- ============================================
-- 1. Create posting_shape_status enum type
-- ============================================
DO $$ BEGIN
  CREATE TYPE posting_shape_status AS ENUM (
    'planned',      -- 配布予定
    'completed',    -- 配布完了
    'unavailable',  -- 配布不可
    'other'         -- その他
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 2. Add status and posting_count columns to posting_shapes
-- ============================================
ALTER TABLE public.posting_shapes
ADD COLUMN IF NOT EXISTS status posting_shape_status DEFAULT 'planned' NOT NULL;

ALTER TABLE public.posting_shapes
ADD COLUMN IF NOT EXISTS posting_count INTEGER DEFAULT NULL;

-- ============================================
-- 3. Add constraint: posting_count required when status is 'completed'
-- ============================================
ALTER TABLE public.posting_shapes
ADD CONSTRAINT posting_count_required_when_completed
CHECK (
  (status = 'completed' AND posting_count IS NOT NULL AND posting_count >= 0)
  OR status != 'completed'
);

-- ============================================
-- 4. Create index on status for filtering
-- ============================================
CREATE INDEX IF NOT EXISTS idx_posting_shapes_status ON public.posting_shapes(status);

-- ============================================
-- 5. Update RLS policies if needed (already enabled via previous migration)
-- ============================================
-- No changes needed - existing policies allow authenticated users full access
