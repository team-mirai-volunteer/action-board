-- 京都府ポスターミッション達成データの復旧
-- 原因: POSTER_PREFECTURE_MAP に京都府が含まれていなかったため、achieveMissionAction のバリデーションが失敗
-- 対象: 京都府のポスター掲示板で done ステータスに更新されたが、poster_activities が存在しないレコード
-- 注意: 復旧対象のデータが作成された期間中、このミッションは is_featured = true だったため、XPは2倍で計算する

DO $$
DECLARE
  poster_mission_id uuid;
  current_season_id uuid;
  rec record;
  new_achievement_id uuid;
  new_artifact_id uuid;
  recovered_count integer := 0;
  -- 定数（src/lib/constants/mission-config.ts と mission_data/missions.yaml の値）
  -- put-up-poster-on-board: difficulty=2, is_featured=true（復旧対象期間中）
  -- ミッションXP: 100(difficulty=2) * 2(featured) = 200
  -- ボーナスXP: 1(MAX_POSTER_COUNT) * 400(POSTER_POINTS_PER_UNIT) * 2(featured) = 800
  MISSION_XP constant integer := 200;
  BONUS_XP constant integer := 800;
  TOTAL_XP constant integer := 1000;
  MAX_POSTER_COUNT constant integer := 1;
BEGIN
  -- ポスターミッションのIDを取得
  SELECT id INTO poster_mission_id
  FROM missions
  WHERE slug = 'put-up-poster-on-board';

  -- ミッションが存在しない場合は静かに終了（初期マイグレーション時など）
  IF poster_mission_id IS NULL THEN
    RAISE NOTICE 'Mission with slug "put-up-poster-on-board" not found. Skipping recovery.';
    RETURN;
  END IF;

  -- 現在のシーズンIDを取得
  SELECT id INTO current_season_id
  FROM seasons
  WHERE is_active = true;

  -- アクティブなシーズンがない場合は静かに終了
  IF current_season_id IS NULL THEN
    RAISE NOTICE 'No active season found. Skipping recovery.';
    RETURN;
  END IF;

  RAISE NOTICE 'Mission ID: %, Season ID: %, Mission XP: %, Bonus XP: %, Total XP: %',
    poster_mission_id, current_season_id, MISSION_XP, BONUS_XP, TOTAL_XP;

  -- 京都府のdone更新でposter_activitiesがないレコードを処理
  FOR rec IN
    SELECT DISTINCT ON (pbsh.user_id, pbsh.board_id)
      pbsh.board_id,
      pbsh.user_id,
      pbsh.note,
      pbsh.created_at as history_created_at,
      pb.prefecture,
      pb.city,
      pb.number,
      pb.name,
      pb.address,
      pb.lat,
      pb.long
    FROM poster_board_status_history pbsh
    JOIN poster_boards pb ON pb.id = pbsh.board_id
    WHERE pb.prefecture = '京都府'
      AND pbsh.new_status = 'done'
      AND NOT EXISTS (
        SELECT 1
        FROM poster_activities pa
        WHERE pa.board_id = pbsh.board_id
          AND pa.user_id = pbsh.user_id
      )
    ORDER BY pbsh.user_id, pbsh.board_id, pbsh.created_at ASC
  LOOP
    -- 1. achievements テーブルに挿入
    INSERT INTO achievements (id, user_id, mission_id, season_id, created_at)
    VALUES (
      gen_random_uuid(),
      rec.user_id,
      poster_mission_id,
      current_season_id,
      rec.history_created_at
    )
    RETURNING id INTO new_achievement_id;

    -- 2. mission_artifacts テーブルに挿入
    INSERT INTO mission_artifacts (id, achievement_id, user_id, artifact_type, text_content, created_at)
    VALUES (
      gen_random_uuid(),
      new_achievement_id,
      rec.user_id,
      'POSTER',
      rec.prefecture || rec.city || ' ' || rec.number || ' - 貼付',
      rec.history_created_at
    )
    RETURNING id INTO new_artifact_id;

    -- 3. poster_activities テーブルに挿入
    INSERT INTO poster_activities (
      id, user_id, mission_artifact_id, poster_count,
      prefecture, city, number, name, note, address, lat, long, board_id, created_at
    )
    VALUES (
      gen_random_uuid(),
      rec.user_id,
      new_artifact_id,
      MAX_POSTER_COUNT,  -- 1
      rec.prefecture,
      rec.city,
      rec.number,
      rec.name,
      rec.note,
      rec.address,
      rec.lat,
      rec.long,
      rec.board_id,
      rec.history_created_at
    );

    -- 4. xp_transactions テーブルに挿入（ミッション完了XP）
    INSERT INTO xp_transactions (
      id, user_id, season_id, xp_amount, source_type, source_id, description, created_at
    )
    VALUES (
      gen_random_uuid(),
      rec.user_id,
      current_season_id,
      MISSION_XP,
      'MISSION_COMPLETION',
      new_achievement_id,
      'ミッション「選挙区ポスターを貼ろう」達成による経験値獲得（データ復旧）',
      rec.history_created_at
    );

    -- 5. xp_transactions テーブルに挿入（ボーナスXP）
    INSERT INTO xp_transactions (
      id, user_id, season_id, xp_amount, source_type, source_id, description, created_at
    )
    VALUES (
      gen_random_uuid(),
      rec.user_id,
      current_season_id,
      BONUS_XP,
      'BONUS',
      new_achievement_id,
      'ポスターボーナス（' || MAX_POSTER_COUNT || '枚=' || BONUS_XP || 'ポイント【2倍】）（データ復旧）',
      rec.history_created_at
    );

    -- 6. user_levels テーブルを更新（XP加算：ミッションXP + ボーナスXP）
    INSERT INTO user_levels (user_id, season_id, xp, level, updated_at)
    VALUES (rec.user_id, current_season_id, TOTAL_XP, 1, now())
    ON CONFLICT (user_id, season_id) DO UPDATE
    SET xp = user_levels.xp + TOTAL_XP,
        updated_at = now();

    recovered_count := recovered_count + 1;
    RAISE NOTICE 'Recovered achievement for user_id: %, board_id: %, total_xp: %',
      rec.user_id, rec.board_id, TOTAL_XP;
  END LOOP;

  -- 7. user_levels のレベルを再計算
  -- レベル計算式: totalXp(L) = (L-1) * (25 + 7.5 * L)
  UPDATE user_levels ul
  SET level = (
    SELECT COALESCE(
      (SELECT level FROM (
        SELECT generate_series(1, 1000) AS level
      ) levels
      WHERE (level - 1) * (25 + 7.5 * level) > ul.xp
      ORDER BY level ASC
      LIMIT 1
      ) - 1,
      1
    )
  )
  WHERE season_id = current_season_id
    AND EXISTS (
      SELECT 1
      FROM poster_board_status_history pbsh
      JOIN poster_boards pb ON pb.id = pbsh.board_id
      WHERE pb.prefecture = '京都府'
        AND pbsh.new_status = 'done'
        AND pbsh.user_id = ul.user_id
    );

  RAISE NOTICE 'Recovery complete. Total records recovered: %', recovered_count;

END $$;
