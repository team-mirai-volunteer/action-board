-- poster_placements テーブルにメモカラムを追加
ALTER TABLE poster_placements ADD COLUMN memo TEXT;

COMMENT ON COLUMN poster_placements.memo IS '自由記入メモ';
