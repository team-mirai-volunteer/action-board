-- city stats ビューの座標を丸めて匿名化
-- ROUND(_, 2) = 小数点2桁 ≈ 1.1km精度。1件のみの市区町村でも個人位置が特定されない。

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
GROUP BY prefecture, city;

COMMENT ON VIEW residential_poster_city_stats IS '市区町村レベルの私有地ポスター掲示集計（個人情報を含まない、座標は匿名化済み）';
ALTER VIEW residential_poster_city_stats SET (security_invoker = true);
