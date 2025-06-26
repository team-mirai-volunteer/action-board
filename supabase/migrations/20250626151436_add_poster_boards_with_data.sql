-- Create enum type for board status
CREATE TYPE board_status AS ENUM ('not_yet', 'posted', 'checked', 'damaged', 'error', 'other');

-- Create poster_boards table with number column
CREATE TABLE poster_boards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  lat decimal(10, 8) NOT NULL,
  lon decimal(11, 8) NOT NULL,
  prefecture text,
  status board_status DEFAULT 'not_yet' NOT NULL,
  number integer,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create poster_board_status_history table to track changes
CREATE TABLE poster_board_status_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id uuid NOT NULL REFERENCES poster_boards(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  previous_status board_status,
  new_status board_status NOT NULL,
  note text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_poster_boards_lat_lon ON poster_boards(lat, lon);
CREATE INDEX idx_poster_boards_prefecture ON poster_boards(prefecture);
CREATE INDEX idx_poster_boards_status ON poster_boards(status);
CREATE INDEX idx_poster_board_status_history_board_id ON poster_board_status_history(board_id);
CREATE INDEX idx_poster_board_status_history_user_id ON poster_board_status_history(user_id);

-- Enable RLS
ALTER TABLE poster_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE poster_board_status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for poster_boards
-- Everyone can view boards
CREATE POLICY "poster_boards_select_policy" ON poster_boards
  FOR SELECT
  USING (true);

-- Anyone can update status (both anonymous and authenticated users)
CREATE POLICY "poster_boards_update_policy" ON poster_boards
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Only service role can insert and delete boards
-- (No INSERT or DELETE policies means only admin can do these operations)

-- RLS Policies for poster_board_status_history
-- Everyone can view history
CREATE POLICY "poster_board_status_history_select_policy" ON poster_board_status_history
  FOR SELECT
  USING (true);

-- Allow both anonymous and authenticated users to insert history records
CREATE POLICY "poster_board_status_history_insert_policy" ON poster_board_status_history
  FOR INSERT
  WITH CHECK (
    (auth.uid() IS NULL AND user_id IS NULL) OR 
    (auth.uid() = user_id)
  );

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on poster_boards
CREATE TRIGGER update_poster_boards_updated_at BEFORE UPDATE ON poster_boards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
