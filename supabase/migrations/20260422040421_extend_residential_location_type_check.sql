-- Extend residential_poster_placements.location_type CHECK constraint to allow
-- poster design types (leader_photo_a1/a2, logo_a1/a2) in addition to existing
-- location types (home, store_office, public_facility, other).
ALTER TABLE residential_poster_placements
  DROP CONSTRAINT IF EXISTS residential_poster_placements_location_type_check;

ALTER TABLE residential_poster_placements
  ADD CONSTRAINT residential_poster_placements_location_type_check
  CHECK (
    location_type IN (
      'home',
      'store_office',
      'public_facility',
      'leader_photo_a1',
      'leader_photo_a2',
      'logo_a1',
      'logo_a2',
      'other'
    )
  );
