CREATE OR REPLACE FUNCTION grant_xp_rank_badges()
RETURNS TRIGGER AS $$
DECLARE
  badge_code_list TEXT[] := ARRAY[
    'TOP10_OVERALL',
    'TOP20_OVERALL',
    'TOP50_OVERALL',
    'TOP100_OVERALL'
  ];
  badge_limits INTEGER[] := ARRAY[10, 20, 50, 100];
  badge_uuid UUID;
  user_rank INTEGER;
BEGIN
  -- 現在のユーザーのランクを取得
  SELECT rank INTO user_rank
  FROM user_ranking_view
  WHERE user_id = NEW.user_id;

  -- 該当するランクバッジをチェック
  FOR i IN 1..array_length(badge_code_list, 1) LOOP
    IF user_rank <= badge_limits[i] THEN
      SELECT id INTO badge_uuid FROM public.badges WHERE code = badge_code_list[i];

      -- すでにバッジを持っていなければ付与
      IF NOT EXISTS (
        SELECT 1 FROM public.user_badges
        WHERE user_id = NEW.user_id AND badge_id = badge_uuid
      ) THEN
        INSERT INTO public.user_badges (user_id, badge_id)
        VALUES (NEW.user_id, badge_uuid);
      END IF;

      -- 上位のバッジだけ付与すればOKなので早期リターン
      RETURN NEW;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trigger_grant_xp_rank_badges
AFTER UPDATE ON public.user_levels
FOR EACH ROW
WHEN (NEW.xp IS DISTINCT FROM OLD.xp)
EXECUTE FUNCTION grant_xp_rank_badges();