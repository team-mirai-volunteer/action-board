-- posting_shapesテーブルにarea_m2カラムを追加
-- 面積ベースでクラスタリング表示を切り替えるために使用

ALTER TABLE public.posting_shapes
ADD COLUMN area_m2 DOUBLE PRECISION;

-- 面積でのフィルタリングを高速化するためのインデックス
CREATE INDEX idx_posting_shapes_area_m2 ON public.posting_shapes(area_m2);

COMMENT ON COLUMN public.posting_shapes.area_m2 IS 'ポリゴンの面積（平方メートル）。Turf.jsで計算。';
