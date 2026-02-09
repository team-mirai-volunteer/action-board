-- =============================================
-- Season 3 開始マイグレーション
-- =============================================

-- 1. season2 を終了
UPDATE seasons
SET is_active = false,
    end_date = '2026-02-07 23:59:59+09',
    updated_at = now()
WHERE slug = 'season2';

-- 2. season3 を作成
INSERT INTO seasons (id, slug, name, start_date, end_date, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'season3',
  '2026春~',
  '2026-02-09 00:00:00+09',
  NULL,
  true,
  now(),
  now()
);

-- ミッションの is_featured / is_hidden 変更は missions.yaml で管理
