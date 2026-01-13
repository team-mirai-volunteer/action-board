-- Create enum type for election subject
CREATE TYPE election_subject AS ENUM (
  '衆院選',
  '参院選',
  '都道府県首長選',
  '市区町村首長選'
);

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
  election_id_param uuid DEFAULT NULL
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
