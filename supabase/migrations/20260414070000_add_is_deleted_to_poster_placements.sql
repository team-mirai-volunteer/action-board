-- Add is_deleted column for soft delete
ALTER TABLE residential_poster_placements
  ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX idx_residential_poster_placements_is_deleted
  ON residential_poster_placements (is_deleted) WHERE is_deleted = false;

-- Recreate city stats view to exclude deleted and removed placements
DROP VIEW IF EXISTS residential_poster_city_stats;
CREATE VIEW residential_poster_city_stats AS
SELECT
  prefecture,
  city,
  SUM(count) AS total_count,
  COUNT(*) AS placement_count,
  ROUND(AVG(lat), 2)::DECIMAL(10, 8) AS avg_lat,
  ROUND(AVG(lng), 2)::DECIMAL(11, 8) AS avg_lng
FROM residential_poster_placements
WHERE prefecture IS NOT NULL AND city IS NOT NULL
  AND is_deleted = false AND is_removed = false
GROUP BY prefecture, city;

COMMENT ON VIEW residential_poster_city_stats IS '市区町村レベルの私有地ポスター掲示集計（個人情報を含まない、座標は匿名化済み）';
ALTER VIEW residential_poster_city_stats SET (security_invoker = true);
