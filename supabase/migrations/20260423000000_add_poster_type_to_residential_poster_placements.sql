-- Add poster_type to residential_poster_placements
ALTER TABLE residential_poster_placements ADD COLUMN poster_type TEXT CONSTRAINT residential_poster_placements_poster_type_check CHECK (poster_type IN ('leader_face_a1', 'leader_face_a2', 'logo_a1', 'logo_a2'));
