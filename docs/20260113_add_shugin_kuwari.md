# 区割り (Electoral Districts) Implementation for Poster Map

## Overview
Support for 衆議院議員選挙 electoral districts (区割り) like 東京1区, 神奈川5区 has been added to the poster map feature. The old prefecture-based data (参議院2025) is archived and accessible via `/map/poster/archive/sangin-2025/[prefecture]`, while the new district-based system (衆議院2026) is the main view.

## Implementation Status: ✅ Complete

---

## What Was Implemented

### 1. Database Schema Changes

**Migration**: `supabase/migrations/20260113000000_add_district_to_poster_boards.sql`

- Added `district` column to `poster_boards` and `staging_poster_boards`
- Added `archived` boolean column with default `false`
- Created index for district filtering
- Auto-archived existing data where district is NULL

**Migration**: `supabase/migrations/20260114000000_add_election_term.sql`

- Added `election_term` column to `poster_boards` and `staging_poster_boards`
- Created index for election_term filtering
- Set `sangin-2025` for archived data, `shugin-2026` for active data

### 2. Data Folder Structure

```
poster_data/data/
├── sangin-2025/          # Archived 参議院選挙 2025 data (prefecture-based)
│   ├── 東京都/
│   ├── 神奈川県/
│   └── ...
└── shugin-2026/          # Active 衆議院選挙 2026 data (district-based)
    └── 東京都/
        └── 千代田区_normalized.csv  # Contains 東京1区 data
```

### 3. CSV Format

**New format with district column**:
```csv
prefecture,city,district,number,address,name,lat,long
東京都,千代田区,東京1区,1,千代田区〇〇1-1,掲示板A,35.6895,139.6917
```

The `load-csv.ts` script handles:
- 8 columns: prefecture, city, district, number, address, name, lat, long
- 9 columns: Same as above + note (ignored)
- 7 columns (legacy): prefecture, city, number, address, name, lat, long

### 4. Constants

**File**: `src/features/map-poster/constants/poster-districts.ts`

```typescript
export const POSTER_DISTRICT_MAP = {
  "tokyo-1": { jp: "東京1区", prefecture: "東京都", center: [35.6895, 139.7536], defaultZoom: 14 },
  // More districts can be added as needed
} as const;

export const JP_TO_EN_DISTRICT: Record<string, string> = {
  "東京1区": "tokyo-1",
};
```

### 5. Service Layer Updates

**File**: `src/features/map-poster/services/poster-boards.ts`

New functions added:
- `getDistrictsWithBoards()` - Get unique districts from DB
- `getPosterBoardsMinimalByDistrict(district)` - Fetch boards for a district
- `getPosterBoardSummaryByDistrict()` - Summary stats by district
- `getArchivedElectionTerms()` - Get available archive terms
- `getArchivedPosterBoardSummary(term)` - Archive summary by prefecture
- `getArchivedPosterBoardsMinimal(term, prefecture)` - Archive boards
- `getArchivedPosterBoardStats(term, prefecture)` - Archive stats

All active data queries filter by:
- `archived = false`
- `district IS NOT NULL`

### 6. Route Structure

```
/map/poster                           # Main page - shows district cards (東京1区, etc.)
/map/poster/tokyo-1                   # District map (東京1区)
/map/poster/archive/sangin-2025       # Archive overview - shows prefecture cards
/map/poster/archive/sangin-2025/tokyo # Archive prefecture map (東京都)
```

### 7. UI Changes

**Main page** (`src/app/map/poster/page.tsx`):
- Shows district cards instead of prefecture cards
- Displays overall progress statistics
- Archive link at bottom: "過去の選挙データを見る（参議院選挙 2025）"

**District map** (`src/app/map/poster/[prefecture]/page.tsx`):
- Validates district from `POSTER_DISTRICT_MAP` or DB
- Shows map with status update functionality
- Back link goes to `/map/poster`

**Archive pages**:
- Read-only mode with amber warning banner
- Clicking boards shows toast: "アーカイブデータは読み取り専用です"
- Back link goes to archive overview

### 8. CSV Loading Script

**File**: `poster_data/load-csv.ts`

- `ACTIVE_DATA_FOLDER = "shugin-2026"` determines which folder to load
- Automatically sets `election_term` based on folder name
- Sets `archived = true` for data without district, `false` for data with district

---

## How to Add New Districts

### 1. Prepare CSV Data

Create CSV file in `poster_data/data/shugin-2026/[都道府県]/[区市町村]_normalized.csv`:

```csv
prefecture,city,district,number,address,name,lat,long
東京都,中央区,東京2区,1,中央区〇〇1-1,掲示板A,35.6839,139.7744
```

### 2. Add District Constants (optional)

If you want custom center/zoom, add to `src/features/map-poster/constants/poster-districts.ts`:

```typescript
export const POSTER_DISTRICT_MAP = {
  "tokyo-1": { jp: "東京1区", ... },
  "tokyo-2": { jp: "東京2区", prefecture: "東京都", center: [35.6839, 139.7744], defaultZoom: 14 },
} as const;

export const JP_TO_EN_DISTRICT: Record<string, string> = {
  "東京1区": "tokyo-1",
  "東京2区": "tokyo-2",
};
```

### 3. Load Data

```bash
npm run poster:load-csv
```

### 4. Verify

Visit `/map/poster` - new district should appear automatically.

---

## Commands

```bash
# Load CSV data from active folder (shugin-2026)
npm run poster:load-csv

# Load specific file
npm run poster:load-csv poster_data/data/shugin-2026/東京都/千代田区_normalized.csv

# Load with verbose output (generates data-changes.md)
npm run poster:load-csv -v

# Regenerate TypeScript types after migration
npm run types

# Run typecheck
npm run typecheck

# Run linter
npm run biome:check:write
```

---

## Verification Checklist

- [x] Migration applied: `district`, `archived`, `election_term` columns exist
- [x] Types regenerated: `npm run types` completed
- [x] CSV loading works: 106 records loaded for 東京1区
- [x] Main page shows district cards (東京1区)
- [x] District map works: `/map/poster/tokyo-1` displays correctly
- [x] Status updates work on district map
- [x] Archive link visible at bottom of main page
- [x] Archive overview works: `/map/poster/archive/sangin-2025`
- [x] Archive prefecture map works (read-only mode)
- [x] Typecheck passes: `npm run typecheck`
- [x] Linter passes: `npm run biome:check:write`
- [x] E2E tests updated for district-based UI
