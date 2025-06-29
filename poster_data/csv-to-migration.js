#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { parse } = require("csv-parse/sync");

// Prefecture mapping from Japanese to enum values
const prefectureMap = {
  北海道: "hokkaido",
  宮城県: "miyagi",
  埼玉県: "saitama",
  千葉県: "chiba",
  東京都: "tokyo",
  神奈川県: "kanagawa",
  長野県: "nagano",
  愛知県: "aichi",
  大阪府: "osaka",
  兵庫県: "hyogo",
  愛媛県: "ehime",
  福岡県: "fukuoka",
};

function generateMigration(csvPath) {
  // Read CSV file
  const csvContent = fs.readFileSync(csvPath, "utf-8");

  // Parse CSV
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  });

  if (records.length === 0) {
    console.error("No records found in CSV");
    return;
  }

  // Generate SQL INSERT statements
  let sql = `-- Migration to add poster boards from ${path.basename(csvPath)}\n`;
  sql += `-- Generated on ${new Date().toISOString()}\n\n`;
  sql +=
    "INSERT INTO poster_boards (name, lat, long, prefecture, status, number, address, city)\nVALUES\n";

  const values = records
    .map((record, index) => {
      const prefecture = prefectureMap[record.prefecture];
      if (!prefecture) {
        console.warn(`Unknown prefecture: ${record.prefecture}`);
        return null;
      }

      // Escape single quotes in text fields
      const name = record.name.replace(/'/g, "''");
      const address = record.address.replace(/'/g, "''");
      const city = record.city.replace(/'/g, "''");

      const isLast = index === records.length - 1;
      return `  ('${name}', ${record.lat}, ${record.long}, '${prefecture}', 'not_yet', '${record.number}', '${address}', '${city}')${isLast ? ";" : ","}`;
    })
    .filter(Boolean)
    .join("\n");

  sql += values;
  sql += "\n";

  return sql;
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log("Usage: node csv-to-migration.js <csv-file> [migration-name]");
    console.log(
      "Example: node csv-to-migration.js kanagawa/青葉区_normalized.csv add_aoba_poster_boards",
    );
    process.exit(1);
  }

  const csvPath = args[0];
  const migrationName =
    args[1] || path.basename(csvPath, ".csv").replace(/_normalized$/, "");

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found: ${csvPath}`);
    process.exit(1);
  }

  try {
    const migration = generateMigration(csvPath);

    // Generate timestamp for migration filename
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T]/g, "")
      .slice(0, 14);
    const filename = `${timestamp}_${migrationName.replace(/[^a-zA-Z0-9_]/g, "_")}.sql`;
    const outputPath = path.join("..", "supabase", "migrations", filename);

    // Write migration file
    fs.writeFileSync(outputPath, migration);

    console.log(`Migration created: ${outputPath}`);
    console.log(`Total records: ${migration.match(/\(/g).length - 1}`);
  } catch (error) {
    console.error("Error generating migration:", error);
    process.exit(1);
  }
}

module.exports = { generateMigration };
