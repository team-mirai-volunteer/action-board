-- Create enum type for election subject
CREATE TYPE election_subject AS ENUM (
  '衆院選',
  '参院選',
  '都道府県首長選',
  '市区町村首長選'
);

-- Extend poster_prefecture_enum to include all 47 prefectures
-- Add missing prefectures in order
ALTER TYPE poster_prefecture_enum ADD VALUE IF NOT EXISTS '青森県' AFTER '北海道';
ALTER TYPE poster_prefecture_enum ADD VALUE IF NOT EXISTS '岩手県' AFTER '青森県';
-- 宮城県 already exists
ALTER TYPE poster_prefecture_enum ADD VALUE IF NOT EXISTS '秋田県' AFTER '宮城県';
ALTER TYPE poster_prefecture_enum ADD VALUE IF NOT EXISTS '山形県' AFTER '秋田県';
ALTER TYPE poster_prefecture_enum ADD VALUE IF NOT EXISTS '福島県' AFTER '山形県';
ALTER TYPE poster_prefecture_enum ADD VALUE IF NOT EXISTS '茨城県' AFTER '福島県';
ALTER TYPE poster_prefecture_enum ADD VALUE IF NOT EXISTS '栃木県' AFTER '茨城県';
ALTER TYPE poster_prefecture_enum ADD VALUE IF NOT EXISTS '群馬県' AFTER '栃木県';
-- 埼玉県 already exists
-- 千葉県 already exists
-- 東京都 already exists
-- 神奈川県 already exists
ALTER TYPE poster_prefecture_enum ADD VALUE IF NOT EXISTS '新潟県' AFTER '神奈川県';
ALTER TYPE poster_prefecture_enum ADD VALUE IF NOT EXISTS '富山県' AFTER '新潟県';
ALTER TYPE poster_prefecture_enum ADD VALUE IF NOT EXISTS '石川県' AFTER '富山県';
ALTER TYPE poster_prefecture_enum ADD VALUE IF NOT EXISTS '福井県' AFTER '石川県';
ALTER TYPE poster_prefecture_enum ADD VALUE IF NOT EXISTS '山梨県' AFTER '福井県';
-- 長野県 already exists
ALTER TYPE poster_prefecture_enum ADD VALUE IF NOT EXISTS '岐阜県' AFTER '長野県';
ALTER TYPE poster_prefecture_enum ADD VALUE IF NOT EXISTS '静岡県' AFTER '岐阜県';
-- 愛知県 already exists
ALTER TYPE poster_prefecture_enum ADD VALUE IF NOT EXISTS '三重県' AFTER '愛知県';
ALTER TYPE poster_prefecture_enum ADD VALUE IF NOT EXISTS '滋賀県' AFTER '三重県';
ALTER TYPE poster_prefecture_enum ADD VALUE IF NOT EXISTS '京都府' AFTER '滋賀県';
-- 大阪府 already exists
-- 兵庫県 already exists
ALTER TYPE poster_prefecture_enum ADD VALUE IF NOT EXISTS '奈良県' AFTER '兵庫県';
ALTER TYPE poster_prefecture_enum ADD VALUE IF NOT EXISTS '和歌山県' AFTER '奈良県';
ALTER TYPE poster_prefecture_enum ADD VALUE IF NOT EXISTS '鳥取県' AFTER '和歌山県';
ALTER TYPE poster_prefecture_enum ADD VALUE IF NOT EXISTS '島根県' AFTER '鳥取県';
ALTER TYPE poster_prefecture_enum ADD VALUE IF NOT EXISTS '岡山県' AFTER '島根県';
ALTER TYPE poster_prefecture_enum ADD VALUE IF NOT EXISTS '広島県' AFTER '岡山県';
ALTER TYPE poster_prefecture_enum ADD VALUE IF NOT EXISTS '山口県' AFTER '広島県';
ALTER TYPE poster_prefecture_enum ADD VALUE IF NOT EXISTS '徳島県' AFTER '山口県';
ALTER TYPE poster_prefecture_enum ADD VALUE IF NOT EXISTS '香川県' AFTER '徳島県';
-- 愛媛県 already exists
ALTER TYPE poster_prefecture_enum ADD VALUE IF NOT EXISTS '高知県' AFTER '愛媛県';
-- 福岡県 already exists
ALTER TYPE poster_prefecture_enum ADD VALUE IF NOT EXISTS '佐賀県' AFTER '福岡県';
ALTER TYPE poster_prefecture_enum ADD VALUE IF NOT EXISTS '長崎県' AFTER '佐賀県';
ALTER TYPE poster_prefecture_enum ADD VALUE IF NOT EXISTS '熊本県' AFTER '長崎県';
ALTER TYPE poster_prefecture_enum ADD VALUE IF NOT EXISTS '大分県' AFTER '熊本県';
ALTER TYPE poster_prefecture_enum ADD VALUE IF NOT EXISTS '宮崎県' AFTER '大分県';
ALTER TYPE poster_prefecture_enum ADD VALUE IF NOT EXISTS '鹿児島県' AFTER '宮崎県';
ALTER TYPE poster_prefecture_enum ADD VALUE IF NOT EXISTS '沖縄県' AFTER '鹿児島県';

-- Create elections table
CREATE TABLE elections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  subject election_subject NOT NULL,
  lgcodes TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_elections_season_id ON elections(season_id);
CREATE INDEX idx_elections_dates ON elections(start_date, end_date);

-- Enable RLS
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for elections
-- Anyone can view elections
CREATE POLICY "elections_select_policy" ON elections
  FOR SELECT
  USING (true);

-- Only admins can manage elections
CREATE POLICY "elections_insert_policy" ON elections
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "elections_update_policy" ON elections
  FOR UPDATE
  USING (false);

CREATE POLICY "elections_delete_policy" ON elections
  FOR DELETE
  USING (false);

-- Add election_id column to poster_board_status_history
ALTER TABLE poster_board_status_history 
ADD COLUMN election_id UUID REFERENCES elections(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_poster_board_status_history_election_id ON poster_board_status_history(election_id);

-- Add comment for documentation
COMMENT ON COLUMN poster_board_status_history.election_id IS 'Reference to the election during which this status change occurred';

-- Trigger to update updated_at on elections
CREATE TRIGGER update_elections_updated_at 
BEFORE UPDATE ON elections
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Insert 2025 Upper House Election record
DO $$
DECLARE
  season1_id UUID;
  election_2025_id UUID;
BEGIN
  -- Get season1 ID
  SELECT id INTO season1_id FROM seasons WHERE slug = 'season1';
  
  -- Insert 2025 Upper House Election
  INSERT INTO elections (season_id, start_date, end_date, subject, lgcodes)
  VALUES (
    season1_id,
    '2025-07-03 00:00:00+09',  -- Election period start
    '2025-07-20 20:00:00+09',  -- Election period end (voting day 8pm)
    '参院選',
    '{01, 04, 11, 12, 13, 14, 20, 23, 27, 28, 38, 40}'  -- 北海道, 宮城県, 埼玉、千葉、東京, 神奈川, 長野, 愛知,大阪、兵庫、愛媛、福岡
  )
  RETURNING id INTO election_2025_id;
  
  -- Update existing poster_board_status_history records to reference this election
  UPDATE poster_board_status_history
  SET election_id = election_2025_id
  WHERE election_id IS NULL;
  
END $$;


-- Update get_poster_board_stats to support election filtering
-- This function filters poster boards based on election_id in poster_board_status_history
CREATE OR REPLACE FUNCTION get_poster_board_stats(
  election_id_param uuid DEFAULT NULL
)
RETURNS TABLE (
  prefecture text,
  status poster_board_status,
  count bigint
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    pb.prefecture::text,
    pb.status,
    COUNT(*)::bigint as count
  FROM poster_boards pb
  WHERE pb.prefecture IS NOT NULL
    AND pb.lat IS NOT NULL 
    AND pb.long IS NOT NULL
    AND (
      election_id_param IS NULL 
      OR pb.id IN (
        SELECT DISTINCT board_id 
        FROM poster_board_status_history 
        WHERE election_id = election_id_param
      )
    )
  GROUP BY pb.prefecture, pb.status
  ORDER BY pb.prefecture, pb.status;
$$;

-- Update get_poster_board_stats_optimized to support election filtering
CREATE OR REPLACE FUNCTION get_poster_board_stats_optimized(
  target_prefecture poster_prefecture_enum,
  election_id_param uuid
)
RETURNS TABLE(
  total_count bigint,
  status_counts jsonb
)
LANGUAGE sql
STABLE
AS $$
  WITH status_summary AS (
    SELECT 
      COUNT(*) FILTER (WHERE status = 'not_yet') AS not_yet_count,
      COUNT(*) FILTER (WHERE status = 'reserved') AS reserved_count,
      COUNT(*) FILTER (WHERE status = 'done') AS done_count,
      COUNT(*) FILTER (WHERE status = 'error_wrong_place') AS error_wrong_place_count,
      COUNT(*) FILTER (WHERE status = 'error_damaged') AS error_damaged_count,
      COUNT(*) FILTER (WHERE status = 'error_wrong_poster') AS error_wrong_poster_count,
      COUNT(*) FILTER (WHERE status = 'other') AS other_count,
      COUNT(*) AS total
    FROM poster_boards pb
    WHERE pb.prefecture = target_prefecture
      AND pb.lat IS NOT NULL 
      AND pb.long IS NOT NULL
      AND (
        election_id_param IS NULL 
        OR pb.id IN (
          SELECT DISTINCT board_id 
          FROM poster_board_status_history 
          WHERE election_id = election_id_param
        )
      )
  )
  SELECT 
    total,
    jsonb_build_object(
      'not_yet', not_yet_count,
      'reserved', reserved_count,
      'done', done_count,
      'error_wrong_place', error_wrong_place_count,
      'error_damaged', error_damaged_count,
      'error_wrong_poster', error_wrong_poster_count,
      'other', other_count
    )
  FROM status_summary;
$$;
