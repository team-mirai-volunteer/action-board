#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import { glob } from "glob";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function maskNamesInCsv(filePath: string): void {
  // Read the CSV file
  const fileContent = readFileSync(filePath, "utf-8");
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  });

  // Check if name column exists
  if (records.length > 0 && !("name" in records[0])) {
    console.log(`Warning: 'name' column not found in ${filePath}`);
    return;
  }

  // Mask names containing '様' or '宅'
  let modified = false;
  for (const record of records) {
    if (
      record.name &&
      (record.name.includes("様") || record.name.includes("宅"))
    ) {
      record.name = "masked";
      modified = true;
    }
  }

  // Write back to the file if any modifications were made
  if (modified) {
    const output = stringify(records, {
      header: true,
      columns: Object.keys(records[0]),
    });
    writeFileSync(filePath, output, "utf-8");
    console.log(`Masked names in: ${filePath}`);
  } else {
    console.log(`No names to mask in: ${filePath}`);
  }
}

async function main(): Promise<void> {
  // Find all CSV files in data and broken_data directories
  const dataPattern = path.join(
    __dirname,
    "data",
    "**",
    "*{_normalized,append}.csv",
  );
  const brokenDataPattern = path.join(
    __dirname,
    "broken_data",
    "**",
    "*{_normalized,append}.csv",
  );

  const dataFiles = await glob(dataPattern);
  const brokenDataFiles = await glob(brokenDataPattern);
  const allFiles = [...dataFiles, ...brokenDataFiles];

  console.log(`Found ${allFiles.length} CSV files to process`);
  console.log("Starting poster:mask-names process...");
  console.log("-".repeat(50));

  // Process each file
  for (const filePath of allFiles.sort()) {
    try {
      maskNamesInCsv(filePath);
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
    }
  }

  console.log("-".repeat(50));
  console.log("poster:mask-names process completed!");
}

// Run the main function
main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
