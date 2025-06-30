# load csv to supabase
we can load all the csvs to supabase without overwriting status

## usage
To load all CSV files into the database:

```bash
npm run poster:load-csv
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
- prefecture: Prefecture name in Japanese (e.g., "神奈川県")
- city: City/ward name in Japanese (e.g., "横浜市青葉区")
- number: Board number (e.g., "1-1")
- address: Full address
- name: Facility/location name
- lat: Latitude
- long: Longitude (note: column name is "long" not "lng")
