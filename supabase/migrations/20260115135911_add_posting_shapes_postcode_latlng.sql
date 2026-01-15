-- Add postcode and center coordinates to posting_shapes table

ALTER TABLE public.posting_shapes ADD COLUMN postcode TEXT;
ALTER TABLE public.posting_shapes ADD COLUMN lat DECIMAL(10, 8);
ALTER TABLE public.posting_shapes ADD COLUMN lng DECIMAL(11, 8);

COMMENT ON COLUMN public.posting_shapes.postcode IS '郵便番号（逆ジオコーディングで自動取得）';
COMMENT ON COLUMN public.posting_shapes.lat IS 'ポリゴン中心の緯度';
COMMENT ON COLUMN public.posting_shapes.lng IS 'ポリゴン中心の経度';
