import { readFileSync } from "node:fs";
import path from "node:path";
import { createServiceClient } from "@/lib/supabase/server";
import { Command } from "commander";
import { glob } from "glob";

const program = new Command();

program
  .option("--dry-run", "Show what would be imported without making changes")
  .option("--batch-size <size>", "Number of records to process at once", "100")
  .parse(process.argv);

const options = program.opts();

interface PosterRecord {
  prefecture: string;
  city: string;
  number: string;
  name: string;
  address: string;
  lat: number;
  long: number;
}

// Parse CSV content into records
function parseCSV(content: string): PosterRecord[] {
  const lines = content.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());

  // Expected headers: prefecture,city,number,name,address,lat,long
  const records: PosterRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());

    if (values.length !== headers.length) {
      console.warn(`Skipping line ${i + 1}: column count mismatch`);
      continue;
    }

    const record: PosterRecord = {
      prefecture: values[0],
      city: values[1],
      number: values[2],
      name: values[3],
      address: values[4],
      lat: Number.parseFloat(values[5]),
      long: Number.parseFloat(values[6]),
    };

    // Validate data
    if (Number.isNaN(record.lat) || Number.isNaN(record.long)) {
      console.warn(`Skipping line ${i + 1}: invalid lat/long values`);
      continue;
    }

    records.push(record);
  }

  return records;
}

async function loadCSVFiles() {
  console.log("🚀 Starting poster data import...");
  console.log(`Mode: ${options.dryRun ? "DRY RUN" : "LIVE"}`);
  console.log(`Batch size: ${options.batchSize}`);

  const supabase = await createServiceClient();

  // Find all CSV files
  const csvFiles = await glob("poster_data/**/*.csv", {
    ignore: ["**/node_modules/**", "**/.*"],
  });

  console.log(`Found ${csvFiles.length} CSV files to process\n`);

  let totalProcessed = 0;
  let totalInserted = 0;
  let totalUpdated = 0;
  let totalErrors = 0;

  for (const file of csvFiles) {
    console.log(`\n📄 Processing ${file}...`);

    try {
      const content = readFileSync(file, "utf-8");
      const records = parseCSV(content);

      console.log(`  Found ${records.length} records`);

      if (options.dryRun) {
        console.log("  [DRY RUN] Would process the following records:");
        records.slice(0, 5).forEach((record, i) => {
          console.log(
            `    ${i + 1}. ${record.prefecture}-${record.city}-${record.number}: ${record.name}`,
          );
        });
        if (records.length > 5) {
          console.log(`    ... and ${records.length - 5} more`);
        }
        totalProcessed += records.length;
        continue;
      }

      // Process in batches
      const batchSize = Number.parseInt(options.batchSize);
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);

        // First, check which records already exist
        const keys = batch.map((r) => ({
          prefecture: r.prefecture,
          city: r.city,
          number: r.number,
        }));

        const { data: existing } = await supabase
          .from("poster_boards")
          .select("prefecture, city, number")
          .or(
            keys
              .map(
                (k) =>
                  `and(prefecture.eq.${k.prefecture},city.eq.${k.city},number.eq.${k.number})`,
              )
              .join(","),
          );

        const existingSet = new Set(
          (existing || []).map((e) => `${e.prefecture}-${e.city}-${e.number}`),
        );

        const toInsert = [];
        const toUpdate = [];

        for (const record of batch) {
          const key = `${record.prefecture}-${record.city}-${record.number}`;
          const data = {
            prefecture: record.prefecture as
              | "hokkaido"
              | "miyagi"
              | "saitama"
              | "chiba"
              | "tokyo"
              | "kanagawa"
              | "nagano"
              | "aichi"
              | "osaka"
              | "hyogo"
              | "ehime"
              | "fukuoka",
            city: record.city,
            number: record.number,
            name: record.name,
            address: record.address,
            lat: record.lat,
            long: record.long,
          };

          if (existingSet.has(key)) {
            toUpdate.push(data);
          } else {
            toInsert.push(data);
          }
        }

        // Insert new records
        if (toInsert.length > 0) {
          const { error } = await supabase
            .from("poster_boards")
            .insert(toInsert);

          if (error) {
            console.error("  ❌ Error inserting records:", error);
            totalErrors += toInsert.length;
          } else {
            console.log(`  ✅ Inserted ${toInsert.length} new records`);
            totalInserted += toInsert.length;
          }
        }

        // Update existing records
        for (const record of toUpdate) {
          const { error } = await supabase
            .from("poster_boards")
            .update({
              name: record.name,
              address: record.address,
              lat: record.lat,
              long: record.long,
              updated_at: new Date().toISOString(),
            })
            .eq("prefecture", record.prefecture)
            .eq("city", record.city)
            .eq("number", record.number);

          if (error) {
            console.error(
              `  ❌ Error updating ${record.prefecture}-${record.city}-${record.number}:`,
              error,
            );
            totalErrors++;
          } else {
            totalUpdated++;
          }
        }

        totalProcessed += batch.length;

        // Progress update
        if (i + batchSize < records.length) {
          console.log(
            `  Progress: ${i + batchSize}/${records.length} records processed`,
          );
        }
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error);
    }
  }

  // Final summary
  console.log("\n📊 Import Summary:");
  console.log(`  Total files processed: ${csvFiles.length}`);
  console.log(`  Total records processed: ${totalProcessed}`);
  if (!options.dryRun) {
    console.log(`  Records inserted: ${totalInserted}`);
    console.log(`  Records updated: ${totalUpdated}`);
    console.log(`  Errors: ${totalErrors}`);

    // Get final count
    const { count } = await supabase
      .from("poster_boards")
      .select("*", { count: "exact", head: true });

    console.log(`  Total records in database: ${count}`);
  }

  console.log("\n✨ Import completed!");
}

// Run the import
loadCSVFiles().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
