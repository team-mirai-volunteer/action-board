-- Add address columns to posting_shapes table for reverse geocoding

ALTER TABLE public.posting_shapes ADD COLUMN prefecture TEXT;
ALTER TABLE public.posting_shapes ADD COLUMN city TEXT;
ALTER TABLE public.posting_shapes ADD COLUMN address TEXT;

COMMENT ON COLUMN public.posting_shapes.prefecture IS '都道府県（逆ジオコーディングで自動取得）';
COMMENT ON COLUMN public.posting_shapes.city IS '市区町村（逆ジオコーディングで自動取得）';
COMMENT ON COLUMN public.posting_shapes.address IS '詳細住所（逆ジオコーディングで自動取得）';
