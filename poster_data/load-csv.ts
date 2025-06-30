import { createReadStream } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import dotenv from "dotenv";
import { glob } from "glob";
import { Client } from "pg";
import { from as copyFrom } from "pg-copy-streams";

// Load environment variables with proper precedence
// Order: actual env vars > .env.local > .env
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

const STAGING_TABLE = "staging_poster_boards";
const TARGET_TABLE = "poster_boards";

async function main() {
  // Construct database URL from Supabase environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Supabase environment variables not found. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local",
    );
  }

  // Parse the Supabase URL to get the database connection string
  // Supabase URL format: http://localhost:54321 (for local) or https://xxx.supabase.co (for cloud)
  const url = new URL(supabaseUrl);
  const isLocal = url.hostname === "localhost";

  let dbUrl: string;
  if (isLocal) {
    // For local development, use the standard local postgres connection
    dbUrl = "postgresql://postgres:postgres@localhost:54322/postgres";
  } else {
    // For cloud, extract project ID from subdomain and construct the connection string
    const projectId = url.hostname.split(".")[0];
    dbUrl = `postgresql://postgres.${projectId}:${supabaseServiceKey}@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres`;
  }

  const db = new Client({ connectionString: dbUrl });
  await db.connect();

  try {
    // Start transaction
    await db.query("BEGIN");

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

    // Commit transaction
    await db.query("COMMIT");
    console.log("✓ Transaction committed successfully");
  } catch (error) {
    // Rollback transaction on error
    await db.query("ROLLBACK");
    console.error("✗ Transaction rolled back due to error:", error);
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
