-- poster_placement_city_stats ビューに平均座標カラムを追加
-- 市区町村集計マーカーの地図上の配置位置に使用する

DROP VIEW IF EXISTS poster_placement_city_stats;

CREATE VIEW poster_placement_city_stats AS
SELECT
  prefecture,
  city,
  SUM(count) AS total_count,
  COUNT(*) AS placement_count,
  AVG(lat)::DECIMAL(10, 8) AS avg_lat,
  AVG(lng)::DECIMAL(11, 8) AS avg_lng
FROM poster_placements
WHERE prefecture IS NOT NULL AND city IS NOT NULL
GROUP BY prefecture, city;

COMMENT ON VIEW poster_placement_city_stats IS '市区町村レベルのポスター掲示集計（個人情報を含まない）';
ALTER VIEW poster_placement_city_stats SET (security_invoker = true);
