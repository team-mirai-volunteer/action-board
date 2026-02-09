-- ===================================
-- mission:sync後に実行するシードデータ
-- ミッションのslugで参照するため、mission:sync後に実行が必要
-- ===================================

-- ポスティングミッションのachievementsを作成
INSERT INTO achievements (id, mission_id, user_id, season_id, created_at)
SELECT
  a.id::uuid,
  m.id as mission_id,
  a.user_id::uuid,
  s.id as season_id,
  a.created_at::timestamptz
FROM (VALUES
  -- posting-activity-magazine（活動報告）
  ('cccccccc-0001-0001-0001-000000000001', 'posting-activity-magazine', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19', '2026-01-10T10:00:00Z'),
  ('cccccccc-0001-0001-0001-000000000002', 'posting-activity-magazine', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19', '2026-01-15T14:30:00Z'),
  ('cccccccc-0001-0001-0001-000000000003', 'posting-activity-magazine', '2c23c05b-8e25-4d0d-9e68-d3be74e4ae8f', '2026-01-12T09:00:00Z'),
  ('cccccccc-0001-0001-0001-000000000004', 'posting-activity-magazine', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '2026-01-14T16:00:00Z'),
  ('cccccccc-0001-0001-0001-000000000005', 'posting-activity-magazine', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', '2026-01-16T11:30:00Z'),
  -- posting-flyer（確認団体ビラ）
  ('cccccccc-0001-0001-0001-000000000006', 'posting-flyer', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19', '2026-01-11T13:00:00Z'),
  ('cccccccc-0001-0001-0001-000000000007', 'posting-flyer', '2c23c05b-8e25-4d0d-9e68-d3be74e4ae8f', '2026-01-13T15:00:00Z')
) AS a(id, slug, user_id, created_at)
JOIN missions m ON m.slug = a.slug
CROSS JOIN seasons s
WHERE s.slug = 'season3'
ON CONFLICT (id) DO NOTHING;

-- ポスティングのmission_artifactsを作成
INSERT INTO mission_artifacts (id, achievement_id, user_id, artifact_type, text_content)
VALUES
  ('dddddddd-0001-0001-0001-000000000001', 'cccccccc-0001-0001-0001-000000000001', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19', 'POSTING', '東京都渋谷区'),
  ('dddddddd-0001-0001-0001-000000000002', 'cccccccc-0001-0001-0001-000000000002', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19', 'POSTING', '東京都新宿区'),
  ('dddddddd-0001-0001-0001-000000000003', 'cccccccc-0001-0001-0001-000000000003', '2c23c05b-8e25-4d0d-9e68-d3be74e4ae8f', 'POSTING', '大阪府大阪市北区'),
  ('dddddddd-0001-0001-0001-000000000004', 'cccccccc-0001-0001-0001-000000000004', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'POSTING', '東京都世田谷区'),
  ('dddddddd-0001-0001-0001-000000000005', 'cccccccc-0001-0001-0001-000000000005', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'POSTING', '神奈川県横浜市西区'),
  ('dddddddd-0001-0001-0001-000000000006', 'cccccccc-0001-0001-0001-000000000006', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19', 'POSTING', '東京都港区'),
  ('dddddddd-0001-0001-0001-000000000007', 'cccccccc-0001-0001-0001-000000000007', '2c23c05b-8e25-4d0d-9e68-d3be74e4ae8f', 'POSTING', '大阪府大阪市中央区')
ON CONFLICT (id) DO NOTHING;

-- ポスティングのposting_activitiesを作成
INSERT INTO posting_activities (mission_artifact_id, posting_count, location_text)
VALUES
  ('dddddddd-0001-0001-0001-000000000001', 50, '東京都渋谷区'),
  ('dddddddd-0001-0001-0001-000000000002', 30, '東京都新宿区'),
  ('dddddddd-0001-0001-0001-000000000003', 100, '大阪府大阪市北区'),
  ('dddddddd-0001-0001-0001-000000000004', 25, '東京都世田谷区'),
  ('dddddddd-0001-0001-0001-000000000005', 80, '神奈川県横浜市西区'),
  ('dddddddd-0001-0001-0001-000000000006', 40, '東京都港区'),
  ('dddddddd-0001-0001-0001-000000000007', 60, '大阪府大阪市中央区')
ON CONFLICT DO NOTHING;
