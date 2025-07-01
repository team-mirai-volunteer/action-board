-- Add board_id column to poster_activities table
ALTER TABLE poster_activities 
ADD COLUMN board_id UUID REFERENCES poster_boards(id);

-- Create index for better query performance
CREATE INDEX idx_poster_activities_board_id ON poster_activities(board_id);

-- Add comment for documentation
COMMENT ON COLUMN poster_activities.board_id IS 'Reference to the specific poster board where the poster was placed';