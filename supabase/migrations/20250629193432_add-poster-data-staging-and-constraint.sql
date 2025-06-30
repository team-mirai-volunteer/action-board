-- Create staging table for poster boards CSV imports (mirrors poster_boards structure)
CREATE TABLE IF NOT EXISTS staging_poster_boards (
    id uuid DEFAULT gen_random_uuid(),
    name text NOT NULL,
    lat decimal(10, 8) NOT NULL,
    long decimal(11, 8) NOT NULL,
    prefecture poster_prefecture_enum NOT NULL,
    status poster_board_status DEFAULT 'not_yet' NOT NULL,
    number text,
    address text NOT NULL,
    city text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add composite unique constraint to poster_boards table if not exists
-- Using city in addition to prefecture and number for more granular uniqueness
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'poster_boards_prefecture_city_number_key'
    ) THEN
        ALTER TABLE poster_boards
            ADD CONSTRAINT poster_boards_prefecture_city_number_key
            UNIQUE (prefecture, city, number);
    END IF;
END $$;