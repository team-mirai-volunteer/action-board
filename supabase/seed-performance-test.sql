-- パフォーマンステスト用: x-likeミッションに2000件の達成データを投入
-- 対象ユーザー: takahiroanno@example.com (622d6984-2f8a-41df-9ac3-cd4dcceb8d19)
--
-- 使い方:
--   psql postgresql://postgres:postgres@localhost:54322/postgres -f scripts/seed-performance-test.sql
--
-- クリーンアップ:
--   DELETE FROM achievements WHERE user_id = '622d6984-2f8a-41df-9ac3-cd4dcceb8d19' AND mission_id = (SELECT id FROM missions WHERE slug = 'x-like');
--   または pnpm run db:reset

DO $$
DECLARE
  v_mission_id UUID;
  v_user_id UUID := '622d6984-2f8a-41df-9ac3-cd4dcceb8d19';
  v_season_id UUID;
  v_achievement_id UUID;
  i INT;
BEGIN
  -- x-likeミッションのIDを取得
  SELECT id INTO v_mission_id FROM missions WHERE slug = 'x-like';
  IF v_mission_id IS NULL THEN
    RAISE EXCEPTION 'x-like mission not found. Run pnpm run mission:sync first.';
  END IF;

  -- アクティブシーズンのIDを取得
  SELECT id INTO v_season_id FROM seasons WHERE is_active = true LIMIT 1;
  IF v_season_id IS NULL THEN
    RAISE EXCEPTION 'No active season found.';
  END IF;

  RAISE NOTICE 'Inserting 2000 achievements for user % on mission % (season %)', v_user_id, v_mission_id, v_season_id;

  FOR i IN 1..2000 LOOP
    v_achievement_id := gen_random_uuid();

    INSERT INTO achievements (id, mission_id, user_id, season_id, created_at)
    VALUES (
      v_achievement_id,
      v_mission_id,
      v_user_id,
      v_season_id,
      now() - (i * INTERVAL '30 minutes')
    );

    INSERT INTO mission_artifacts (achievement_id, user_id, artifact_type, link_url, created_at, updated_at)
    VALUES (
      v_achievement_id,
      v_user_id,
      'LINK',
      'https://x.com/teammirai_pr/status/' || (1000000000000000000 + i)::TEXT,
      now() - (i * INTERVAL '30 minutes'),
      now() - (i * INTERVAL '30 minutes')
    );
  END LOOP;

  RAISE NOTICE 'Done. Inserted 2000 achievements + 2000 mission_artifacts.';
END $$;
