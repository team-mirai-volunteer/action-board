-- Add memo column to posting_shapes table
-- Issue #1605: ポスティングマップのモーダルにメモ機能を追加

-- Add memo column (optional text field for user notes about shapes)
ALTER TABLE public.posting_shapes
ADD COLUMN memo TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.posting_shapes.memo IS 'User notes for shapes (optional input)';
