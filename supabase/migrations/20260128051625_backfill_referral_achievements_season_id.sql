-- Backfill season_id for referral achievements
-- This migration fixes achievements for the 'referral' mission that have NULL season_id
-- by setting season_id based on the created_at date falling within each season's date range

DO $$
DECLARE
  referral_mission_id UUID;
BEGIN
  -- Get the referral mission ID by slug
  SELECT id INTO referral_mission_id FROM missions WHERE slug = 'referral';

  IF referral_mission_id IS NULL THEN
    RAISE NOTICE 'Referral mission not found';
    RETURN;
  END IF;

  -- Update achievements with NULL season_id
  -- Set season_id based on created_at date falling within season date range
  UPDATE achievements a
  SET season_id = s.id
  FROM seasons s
  WHERE a.mission_id = referral_mission_id
    AND a.season_id IS NULL
    AND a.created_at >= s.start_date
    AND a.created_at <= COALESCE(s.end_date, '9999-12-31'::timestamptz);
END $$;
