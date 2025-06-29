import { createReadStream } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { glob } from "glob";
import { Client } from "pg";
import { from as copyFrom } from "pg-copy-streams";

const STAGING_TABLE = "staging_poster_boards";
const TARGET_TABLE = "poster_boards";

async function main() {
  // Get database URL from environment
  const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (!dbUrl) {
    throw new Error(
      "Database URL not found. Set DATABASE_URL or SUPABASE_DB_URL environment variable.",
    );
  }

  const db = new Client({ connectionString: dbUrl });
  await db.connect();

  try {
    // Clear staging table
    console.log("Clearing staging table...");
    await db.query(`TRUNCATE ${STAGING_TABLE}`);

    // Find all CSV files in poster_data directory and subdirectories
    const csvFiles = await glob("poster_data/**/*.csv", {
      ignore: ["**/node_modules/**", "**/.*"],
    });

    console.log(`Found ${csvFiles.length} CSV files to load`);

    // Load each CSV file into staging
    for (const file of csvFiles) {
      console.log(`Loading ${file}...`);

      const copyQuery = copyFrom(
        `COPY ${STAGING_TABLE} (prefecture, city, number, name, address, lat, long)
         FROM STDIN WITH (FORMAT csv, HEADER true, DELIMITER ',')`,
      );

      try {
        await pipeline(createReadStream(file), db.query(copyQuery));
        console.log(`✓ Loaded ${file}`);
      } catch (error) {
        console.error(`✗ Failed to load ${file}:`, error);
        throw error;
      }
    }

    // Insert from staging to production table
    console.log("\nInserting data into production table...");
    const result = await db.query(`
      INSERT INTO ${TARGET_TABLE} (prefecture, city, number, name, address, lat, long)
      SELECT prefecture, city, number, name, address, lat, long
      FROM ${STAGING_TABLE}
      ON CONFLICT (prefecture, city, number)
      DO UPDATE SET
        name = EXCLUDED.name,
        address = EXCLUDED.address,
        lat = EXCLUDED.lat,
        long = EXCLUDED.long,
        updated_at = timezone('utc'::text, now())
      RETURNING id
    `);

    console.log(`✓ Inserted/updated ${result.rowCount} records`);

    // Get final count
    const countResult = await db.query(`SELECT COUNT(*) FROM ${TARGET_TABLE}`);
    console.log(
      `\nTotal records in ${TARGET_TABLE}: ${countResult.rows[0].count}`,
    );
  } catch (error) {
    console.error("Error during import:", error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
