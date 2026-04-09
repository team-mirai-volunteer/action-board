-- Add placed_date, location_type, is_removed to residential_poster_placements
ALTER TABLE residential_poster_placements ADD COLUMN placed_date DATE;
ALTER TABLE residential_poster_placements ADD COLUMN location_type TEXT CHECK (location_type IN ('home', 'store_office', 'public_facility', 'other'));
ALTER TABLE residential_poster_placements ADD COLUMN is_removed BOOLEAN NOT NULL DEFAULT false;
