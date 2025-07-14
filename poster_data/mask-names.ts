#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import { glob } from "glob";
import { extractWardFromAddress } from "./designated-cities.js";

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

  // Check if required columns exist
  if (records.length > 0) {
    const firstRecord = records[0];
    if (!("name" in firstRecord)) {
      console.log(`Warning: 'name' column not found in ${filePath}`);
      return;
    }
    if (
      !("prefecture" in firstRecord) ||
      !("city" in firstRecord) ||
      !("address" in firstRecord)
    ) {
      console.log(
        `Warning: Required columns (prefecture, city, address) not found in ${filePath}`,
      );
      return;
    }
  }

  // Process each record
  let modified = false;
  for (const record of records) {
    // Mask personal names in name field
    if (record.name && hasPersonalName(record.name)) {
      record.name = "masked";
      modified = true;
    }

    // For address field: process only if it contains personal name
    if (record.address && hasPersonalName(record.address)) {
      if (record.prefecture && record.city) {
        // Check if it's a designated city
        const wardExtracted = extractWardFromAddress(
          record.prefecture,
          record.city,
          record.address,
        );

        if (wardExtracted !== record.address && wardExtracted !== "masked") {
          // Ward was successfully extracted from designated city
          record.address = wardExtracted;
          modified = true;
        } else {
          // Not a designated city or ward couldn't be extracted
          const cleanedAddress = removePersonalNameFromAddress(record.address);
          if (cleanedAddress !== record.address) {
            record.address = cleanedAddress;
            modified = true;
          }
        }
      } else {
        // Prefecture/city info missing - use original logic
        const cleanedAddress = removePersonalNameFromAddress(record.address);
        if (cleanedAddress !== record.address) {
          record.address = cleanedAddress;
          modified = true;
        }
      }
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

function hasPersonalName(str: string): boolean {
  if (str.includes("様")) {
    return true;
  }
  if (str.includes("宅") && !str.includes("住宅")) {
    return true;
  }
  return false;
}

function removePersonalNameFromAddress(address: string): string {
  if (!hasPersonalName(address)) {
    return address;
  }

  // 個人名部分のパターンを定義
  const personalNamePattern = /[一-龯ぁ-んァ-ヶｱ-ﾝﾞﾟA-Za-z\s・]+(様|宅).*$/;

  let cleanedAddress = address;
  cleanedAddress = cleanedAddress.replace(personalNamePattern, "").trim();

  // 住宅は除外しない（個人名ではないため）
  if (
    address.includes("住宅") &&
    cleanedAddress.length < address.length * 0.5
  ) {
    return address; // 住宅の場合は元のまま返す
  }

  // もし元の文字列の30%未満になった場合（住所部分が少なすぎる）はmasked
  if (cleanedAddress.length < address.length * 0.3) {
    return "masked";
  }

  return cleanedAddress;
}

async function main(): Promise<void> {
  // Find all CSV files in data and broken_data directories
  const dataPattern = path.join(__dirname, "data", "**", "*_normalized.csv");
  const brokenDataPattern = path.join(
    __dirname,
    "broken_data",
    "**",
    "*_normalized.csv",
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
