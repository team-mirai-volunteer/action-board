import { createReadStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import dotenv from "dotenv";
import { glob } from "glob";
import { Client } from "pg";
import { from as copyFrom } from "pg-copy-streams";

// Load environment variables with proper precedence
// Don't load .env files if environment variables are already set (e.g., from cloud build or manual export)
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  // Order: .env.local > .env
  dotenv.config({ path: ".env" });
  dotenv.config({ path: ".env.local", override: true });
}

const STAGING_TABLE = "staging_poster_boards";
const TARGET_TABLE = "poster_boards";

async function main() {
  // Construct database URL from Supabase environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseDbPassword = process.env.SUPABASE_DB_PASSWORD;

  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL not found. Make sure it's set in .env.local",
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
    // For cloud, we need the database password
    if (!supabaseDbPassword) {
      throw new Error(
        "SUPABASE_DB_PASSWORD not found. This is required for cloud database connections.",
      );
    }
    // Extract project ID from subdomain and construct the connection string
    const projectId = url.hostname.split(".")[0];
    dbUrl = `postgresql://postgres.${projectId}:${supabaseDbPassword}@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres`;
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

      // We always need to use a temp table because of the enum type
      const tempTable = `temp_import_${Date.now()}`;

      // Create a savepoint for this file
      const savepoint = `sp_${Date.now()}`;
      await db.query(`SAVEPOINT ${savepoint}`);

      // First try with 7 columns (no note)
      try {
        await db.query(`
          CREATE TEMP TABLE ${tempTable} (
            prefecture TEXT,
            city TEXT,
            number TEXT,
            name TEXT,
            address TEXT,
            lat TEXT,
            long TEXT
          )
        `);

        const copyQuery = copyFrom(
          `COPY ${tempTable} FROM STDIN WITH (FORMAT csv, HEADER true, DELIMITER ',')`,
        );

        await pipeline(createReadStream(file), db.query(copyQuery));

        // Insert with type casting, skipping rows with invalid lat/long
        const insertResult = await db.query(`
          INSERT INTO ${STAGING_TABLE} (prefecture, city, number, name, address, lat, long)
          SELECT 
            prefecture::poster_prefecture_enum,
            city,
            number,
            name,
            address,
            lat::decimal(10, 8),
            long::decimal(11, 8)
          FROM ${tempTable}
          WHERE lat NOT IN ('None', '') 
            AND long NOT IN ('None', '')
            AND lat IS NOT NULL 
            AND long IS NOT NULL
        `);

        // Check if any rows were skipped
        const totalRows = await db.query(`SELECT COUNT(*) FROM ${tempTable}`);
        const skipped =
          Number(totalRows.rows[0].count) - (insertResult.rowCount || 0);
        if (skipped > 0) {
          console.log(`  ⚠️  Skipped ${skipped} rows with invalid coordinates`);
        }

        await db.query(`DROP TABLE ${tempTable}`);
        console.log(`✓ Loaded ${file} (7 columns)`);
        await db.query(`RELEASE SAVEPOINT ${savepoint}`);
      } catch (error) {
        // Rollback to savepoint to clear the error state
        await db.query(`ROLLBACK TO SAVEPOINT ${savepoint}`);

        // If it fails with "extra data", try with note column
        if (
          error instanceof Error &&
          "code" in error &&
          error.code === "22P04" &&
          error.message.includes("extra data")
        ) {
          console.log("  Retrying with note column...");

          // Create a new temp table with note column
          await db.query(`
            CREATE TEMP TABLE ${tempTable} (
              prefecture TEXT,
              city TEXT,
              number TEXT,
              address TEXT,
              name TEXT,
              lat TEXT,
              long TEXT,
              note TEXT
            )
          `);

          const copyQueryWithNote = copyFrom(
            `COPY ${tempTable} FROM STDIN WITH (FORMAT csv, HEADER true, DELIMITER ',')`,
          );

          try {
            await pipeline(createReadStream(file), db.query(copyQueryWithNote));

            // Insert only the columns we need from temp to staging
            const insertResult = await db.query(`
              INSERT INTO ${STAGING_TABLE} (prefecture, city, number, name, address, lat, long)
              SELECT 
                prefecture::poster_prefecture_enum,
                city,
                number,
                name,
                address,
                lat::decimal(10, 8),
                long::decimal(11, 8)
              FROM ${tempTable}
              WHERE lat NOT IN ('None', '') 
                AND long NOT IN ('None', '')
                AND lat IS NOT NULL 
                AND long IS NOT NULL
            `);

            // Check if any rows were skipped
            const totalRows = await db.query(
              `SELECT COUNT(*) FROM ${tempTable}`,
            );
            const skipped =
              Number(totalRows.rows[0].count) - (insertResult.rowCount || 0);
            if (skipped > 0) {
              console.log(
                `  ⚠️  Skipped ${skipped} rows with invalid coordinates`,
              );
            }

            await db.query(`DROP TABLE ${tempTable}`);
            console.log(`✓ Loaded ${file} (8 columns, note ignored)`);
            await db.query(`RELEASE SAVEPOINT ${savepoint}`);
          } catch (error2) {
            console.error(`✗ Failed to load ${file}:`, error2);
            throw error2;
          }
        } else {
          console.error(`✗ Failed to load ${file}:`, error);
          throw error;
        }
      }
    }

    // Insert from staging to production table
    // Note: Duplicates are now allowed, so we insert all records
    console.log("\nInserting data into production table...");
    const result = await db.query(`
      INSERT INTO ${TARGET_TABLE} (prefecture, city, number, name, address, lat, long)
      SELECT prefecture, city, number, name, address, lat, long
      FROM ${STAGING_TABLE}
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
