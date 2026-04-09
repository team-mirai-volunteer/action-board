-- residential_poster_placements テーブルにメモカラムを追加
ALTER TABLE residential_poster_placements ADD COLUMN memo TEXT;

COMMENT ON COLUMN residential_poster_placements.memo IS '自由記入メモ';
