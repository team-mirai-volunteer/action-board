# Poster Data Management

This directory contains tools for managing poster board location data.

## Directory Structure

```
poster_data/
├── data/            # Successfully loaded CSV files
│   └── <prefecture>/   # Organized by prefecture
├── raw_data/        # Raw CSV files copied from Google Drive (gitignored)
├── broken_data/     # CSV files that failed to load (gitignored)
├── temp/            # Temporary directory for processing (gitignored)
├── load-csv.ts      # Script to load CSV files into the database
├── auto-load-from-drive.ts  # Automated script to process files from Google Drive
├── choice.md        # Log of file selection choices
└── .processed-files.json  # Track of processed files
```

## Usage

### Automated Loading from Google Drive

To automatically load poster data from Google Drive:

```bash
npm run poster:auto-load
```

To run with logging to both console and file:

```bash
npm run poster:auto-load:log
```

This will create a timestamped log file like `poster_data/auto-load-20250702-143000.log`

This script will:
1. Copy data from the Google Drive shared folder to `raw_data/`
2. Find all `*_normalized.csv` files at the prefecture/city level
3. For each location:
   - If multiple normalized files exist, automatically selects the shortest one
   - Logs the selection to `choice.md`
   - Copy the file to `temp/` and run `npm run poster:load-csv`
   - If successful, copy the file to `poster_data/data/<prefecture>/`
   - If failed, copy the file to `broken_data/<prefecture>/`
4. Display a summary of processed files

### Manual CSV Loading

To load all CSV files from poster_data/data into the database:

```bash
npm run poster:load-csv
```

To load a specific CSV file:

```bash
npm run poster:load-csv path/to/specific/file.csv
```

This script will:
1. Connect to your Supabase database using the DATABASE_URL from .env.local
2. Create a staging_poster_boards table if it doesn't exist
3. Add a composite unique constraint (prefecture, city, number) to poster_boards table
4. Find all CSV files in poster_data/**/*.csv
5. Load each CSV into the staging table using pg-copy-streams for fast import
6. Insert from staging to poster_boards with ON CONFLICT DO NOTHING to skip duplicates
7. Report statistics on how many records were inserted vs skipped

## CSV Format

CSV files should have the following columns:
- Without note: `prefecture,city,number,name,address,lat,long`
- With note: `prefecture,city,number,address,name,lat,long,note`

The script automatically detects the format and handles both cases.

## Important Notes

- Never write to the Google Drive source directory
- The `raw_data/`, `broken_data/`, and `temp/` directories are gitignored
- Successfully processed files are kept in `poster_data/data/<prefecture>/` for version control
- Files with invalid coordinates (None, empty, or null) are automatically skipped
- The database uses `row_number` + `file_name` as unique keys to prevent duplicates
