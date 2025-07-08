-- Create poster_board_totals table to store actual bulletin board counts from election management committees
CREATE TABLE IF NOT EXISTS poster_board_totals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prefecture poster_prefecture_enum NOT NULL,
  city text,
  total_count integer NOT NULL CHECK (total_count > 0),
  source text, -- Data source (e.g., election management committee name)
  note text, -- Additional notes
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(prefecture, city)
);

-- Enable RLS on poster_board_totals
ALTER TABLE poster_board_totals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for poster_board_totals
-- Allow everyone (including anonymous users) to read
CREATE POLICY "Allow public read access to poster_board_totals" ON poster_board_totals
  FOR SELECT
  TO public
  USING (true);

-- Allow only service role to insert/update/delete
CREATE POLICY "Allow service role to manage poster_board_totals" ON poster_board_totals
  FOR ALL
  TO service_role
  USING (true);

-- Create index for faster lookups
CREATE INDEX idx_poster_board_totals_prefecture ON poster_board_totals(prefecture);
CREATE INDEX idx_poster_board_totals_prefecture_city ON poster_board_totals(prefecture, city);

-- Add updated_at trigger
CREATE TRIGGER update_poster_board_totals_updated_at
  BEFORE UPDATE ON poster_board_totals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial data from election management committees
INSERT INTO poster_board_totals (prefecture, city, total_count, source, note) VALUES
  ('東京都', NULL, 14076, '選挙管理委員会', NULL),
  ('兵庫県', NULL, 13096, '選挙管理委員会', NULL),
  ('埼玉県', NULL, 12606, '選挙管理委員会', NULL),
  ('神奈川県', NULL, 12264, '選挙管理委員会', NULL),
  ('大阪府', NULL, 12059, '選挙管理委員会', NULL),
  ('愛知県', NULL, 11665, '選挙管理委員会', NULL),
  ('千葉県', NULL, 11118, '選挙管理委員会', NULL),
  ('北海道', NULL, 9670, '選挙管理委員会', NULL),
  ('長野県', NULL, 9288, '選挙管理委員会', '選管データを教えて頂いた'),
  ('福岡県', NULL, 8047, '選挙管理委員会', '80%'),
  ('宮城県', NULL, 5301, '選挙管理委員会', NULL),
  ('愛媛県', NULL, 3053, '選挙管理委員会', NULL)
ON CONFLICT (prefecture, city) DO UPDATE SET
  total_count = EXCLUDED.total_count,
  source = EXCLUDED.source,
  note = EXCLUDED.note,
  updated_at = now();