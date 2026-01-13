# 区割り (Electoral Districts) Implementation Plan for Poster Map

## Overview
Add support for 衆議院議員選挙 electoral districts (区割り) like 東京1区, 神奈川5区 to the poster map feature. The old prefecture-based data will be archived, and the new district-based system will take over.

## Key Decisions
- **Data Format**: New `district` column in CSV (e.g., "東京1区", "神奈川5区")
- **Archive Strategy**: Archive old prefecture data, show only new district data
- **URL Structure**: Flat structure `/map/poster/tokyo-1`, `/map/poster/kanagawa-5`

---

## Implementation Steps

### Step 1: Database Schema Changes

**File**: Create new migration `supabase/migrations/YYYYMMDD_add_district_to_poster_boards.sql`

```sql
-- Add district column to poster_boards
ALTER TABLE poster_boards
ADD COLUMN district text;

-- Add district column to staging_poster_boards
ALTER TABLE staging_poster_boards
ADD COLUMN district text;

-- Add index for district filtering
CREATE INDEX idx_poster_boards_district ON poster_boards(district);

-- Add archived flag for old data
ALTER TABLE poster_boards
ADD COLUMN archived boolean DEFAULT false;

-- Archive existing data (run this after migration)
UPDATE poster_boards SET archived = true WHERE district IS NULL;
```

### Step 2: Update TypeScript Types

**File**: [src/features/map-poster/types/poster-types.ts](src/features/map-poster/types/poster-types.ts)

- Run `npm run types` after migration to regenerate Supabase types
- Types will auto-update with new `district` and `archived` columns

### Step 3: Add District Constants

**File**: Create `src/features/map-poster/constants/poster-districts.ts`

```typescript
// Map district keys to display data
export const POSTER_DISTRICT_MAP = {
  "tokyo-1": { jp: "東京1区", prefecture: "東京都", center: [...], defaultZoom: 13 },
  "tokyo-2": { jp: "東京2区", ... },
  "kanagawa-5": { jp: "神奈川5区", ... },
  // Add up to ~20 districts initially
} as const;

// Reverse lookup: "東京1区" -> "tokyo-1"
export const JP_TO_EN_DISTRICT: Record<string, string>;

// Valid district keys for routing
export const VALID_DISTRICTS: string[];
```

### Step 4: Update CSV Loading Script

**File**: [poster_data/load-csv.ts](poster_data/load-csv.ts)

**Current CSV format**: `prefecture, city, number, address, name, lat, long, [note]`
**New CSV format**: `prefecture, city, district, number, address, name, lat, long, [note]`

Changes needed:
1. Update temp table creation to include `district` column
2. Update COPY statement to include `district` column
3. Update INSERT statement to map `district` to staging/production tables
4. Update upsert ON CONFLICT to include `district` in update clause

Key changes in the script:
```typescript
// Update temp table creation (around line 142)
CREATE TEMP TABLE ${tempTable} (
  row_num SERIAL,
  prefecture TEXT,
  city TEXT,
  district TEXT,  // NEW
  number TEXT,
  name TEXT,
  address TEXT,
  lat TEXT,
  long TEXT
)

// Update COPY statement (around line 155)
COPY ${tempTable} (prefecture, city, district, number, address, name, lat, long) FROM STDIN...

// Update INSERT statement (around line 162)
INSERT INTO ${STAGING_TABLE} (prefecture, city, district, number, name, address, lat, long, row_number, file_name)
SELECT prefecture::poster_prefecture_enum, city, district, number, name, address, ...

// Update final upsert (around line 265)
INSERT INTO ${TARGET_TABLE} (prefecture, city, district, number, name, address, lat, long, row_number, file_name)
...ON CONFLICT ... DO UPDATE SET district = EXCLUDED.district, ...
```

### Step 5: Update Service Layer

**File**: [src/features/map-poster/services/poster-boards.ts](src/features/map-poster/services/poster-boards.ts)

Changes:
1. Add `archived = false` filter to all queries
2. Add new functions:
   - `getPosterBoardsByDistrict(district: string)`
   - `getDistrictsWithBoards()`
   - `getPosterBoardStatsByDistrict(district: string)`
3. Update `getPosterBoardSummaryByPrefecture` → `getPosterBoardSummaryByDistrict`

### Step 6: Update Actions

**File**: [src/features/map-poster/actions/poster-boards.ts](src/features/map-poster/actions/poster-boards.ts)

- Add district-based stats action
- Update RPC calls or create new ones for district aggregation

### Step 7: Update Main Poster Map Page

**File**: [src/app/map/poster/page.tsx](src/app/map/poster/page.tsx)

Changes:
1. Fetch district summary instead of prefecture summary
2. Display district cards (東京1区, 東京2区, ...) instead of prefecture cards
3. Update links to `/map/poster/tokyo-1` format

### Step 8: Update Dynamic Route Page

**File**: [src/app/map/poster/[prefecture]/page.tsx](src/app/map/poster/[prefecture]/page.tsx)

Changes:
1. Rename to `[district]` or handle both district and legacy prefecture params
2. Validate against `POSTER_DISTRICT_MAP` instead of `POSTER_PREFECTURE_MAP`
3. Fetch boards by district instead of prefecture
4. Update center coordinates and zoom from district config

### Step 9: Update Client Components

**Files**:
- [src/features/map-poster/components/poster-map-page-client-optimized.tsx](src/features/map-poster/components/poster-map-page-client-optimized.tsx)
- [src/features/map-poster/components/prefecture-poster-map-client.tsx](src/features/map-poster/components/prefecture-poster-map-client.tsx)

Changes:
1. Update props to use district instead of prefecture
2. Update display labels (東京1区 instead of 東京都)
3. Adjust default zoom levels for smaller district areas

### Step 10: Update poster_board_totals (if needed)

If official board counts are tracked per district, update:
- Database table to store district-level totals
- Service function to fetch district totals

---

## Files to Modify (Summary)

| File | Change Type |
|------|-------------|
| `supabase/migrations/new_migration.sql` | Create |
| `src/features/map-poster/constants/poster-districts.ts` | Create |
| `src/features/map-poster/types/poster-types.ts` | Regenerate |
| `poster_data/load-csv.ts` | Modify |
| `src/features/map-poster/services/poster-boards.ts` | Modify |
| `src/features/map-poster/actions/poster-boards.ts` | Modify |
| `src/app/map/poster/page.tsx` | Modify |
| `src/app/map/poster/[prefecture]/page.tsx` | Modify/Rename |
| `src/features/map-poster/components/poster-map-page-client-optimized.tsx` | Modify |
| `src/features/map-poster/components/prefecture-poster-map-client.tsx` | Modify |

---

## Minimum Viable Implementation (東京1区 Only)

To get a minimum working version with just 東京1区:

### Phase 1: Database & Types
1. Create migration with `district` and `archived` columns
2. Run `supabase migration up` locally
3. Run `npm run types` to regenerate TypeScript types

### Phase 2: Data Loading
4. Update `load-csv.ts` to parse new CSV format with district column
5. Prepare test CSV file with 東京1区 data
6. Run `npm run poster:load-csv` to load test data

### Phase 3: Constants & Services
7. Create `poster-districts.ts` with tokyo-1 entry
8. Add `getPosterBoardsByDistrict()` function to services
9. Add `archived = false` filter to existing queries

### Phase 4: UI Updates
10. Update `[prefecture]/page.tsx` to handle district param
11. Update main `page.tsx` to show district cards
12. Test the full flow in browser

---

## Verification Steps

1. Run migration: `supabase migration up`
2. Regenerate types: `npm run types`
3. Load test CSV with district data: `npm run poster:load-csv`
4. Start dev server: `npm run dev`
5. Navigate to `/map/poster` - should show 東京1区 card
6. Click 東京1区 - should show map with boards
7. Verify board status update still works
8. Run typecheck: `npm run typecheck`
9. Run linter: `npm run biome:check:write`
