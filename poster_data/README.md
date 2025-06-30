# load csv to supabase
- we will need to load many csvs into supabase
- in order to keep this organized, we will have a script do this

## what we want
- all poster_data/**/*.csv files will load into supabase
- copy into staging to type check -> load to the actual db
- will dedupe by setting a composite unique constraint on (prefecture-city-number)
- we DONT want to update the status

## Usage

To load all CSV files into the database:

```bash
npm run poster:load-csv
```

This script will:
1. Connect to your Supabase database using the DATABASE_URL from .env.local
2. Create a staging_raw table if it doesn't exist
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

## Environment Variables

The script requires DATABASE_URL to be set in .env.local:
```
DATABASE_URL=postgresql://postgres:[password]@[host]:[port]/postgres
```

## how to do it
- alter table 
```
-- if the table already exists and has id uuid as PK
alter table prod
    add constraint prod_prefecture_city_number_key
    unique (prefecture, city, number);    -- ← composite UNIQUE constraint
```

- load via staging_raw table (temp load to check data)
```
await db.query(`truncate staging_raw`);

for (const file of csvFiles) {
  await pipeline(
    createReadStream(file),
    db.query(copyFrom(
      `COPY staging_raw (prefecture, number, col3, col4)
       FROM STDIN WITH (FORMAT csv, HEADER true)`
    ))
  );
}

/* One statement, safe & fast */
await db.query(`
  insert into prod (prefecture, number, col3, col4)
  select prefecture, number, col3, col4
  from   staging_raw
  on conflict (prefecture, number)  -- <<<<<<<<<<<<<<<<<<<<<
  do nothing                        -- skip exact duplicates
`);
```


- full code like

```
import { Client }            from 'pg';
import { from as copyFrom }  from 'pg-copy-streams';
import { createReadStream }  from 'fs';
import { readdir }           from 'fs/promises';
import { pipeline }          from 'stream/promises';
import path                  from 'path';

const DATA_DIR   = './data';              // all CSVs live here
const STAGING    = 'staging_raw';         // empty, no indexes
const TARGET     = 'prod';
const COPY_SQL   =
  `COPY ${STAGING} (col1,col2,...) FROM STDIN WITH (FORMAT csv, HEADER true)`;

async function main() {
  const db = new Client({ connectionString: process.env.SUPABASE_DB_URL });
  await db.connect();

  // fresh staging every run
  await db.query(`truncate ${STAGING}`);

  for (const f of await readdir(DATA_DIR)) {
    if (!f.endsWith('.csv')) continue;
    console.log('loading', f);

    // 1--- stream CSV → staging
    await pipeline(
      createReadStream(path.join(DATA_DIR, f)),
      db.query(copyFrom(COPY_SQL))
    );
  }

  // 2--- upsert everything into the real table, drop dup keys
  await db.query(`
    insert into ${TARGET} (col1,col2,...)
    select col1,col2,... from ${STAGING}
    on conflict do nothing
  `);

  await db.end();
}

main().catch(e => { console.error(e); process.exit(1); });
```


## other concerns
- fixing data will be done via migration or directly on the UI
    - migration will be upsert
    - any changed data should be exported to be put in later
