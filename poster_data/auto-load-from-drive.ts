#!/usr/bin/env tsx

import { execSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { appendFile, copyFile, mkdir, rm } from "node:fs/promises";
import { basename, join } from "node:path";
import { stdin as input, stdout as output } from "node:process";
import * as readline from "node:readline/promises";

const SOURCE_PATH =
  "~/Google Drive/Shared drives/チームみらい(外部共有)/ポスター・ポスティングロジ/ポスター・ポスティング作業用/ポスター/ポスター掲示場CSV化/自治体";
const SUCCESS_DATA_DIR = "poster_data/data";
const BROKEN_DATA_DIR = "poster_data/broken_data";
const TEMP_DIR = "poster_data/temp";
const CHOICE_LOG_FILE = "poster_data/choice.md";
const PROCESSED_FILES_LOG = "poster_data/processed-files.json";

// Priority files - these should be chosen first even if they're not the shortest
const PRIORITY_FILES = [
  "横浜市_normalized.csv",
  "北九州市_normalized.csv",
  "福岡市_normalized.csv",
];

// Expand tilde to home directory
function expandTilde(path: string): string {
  if (path.startsWith("~/")) {
    return path.replace("~", process.env.HOME || "");
  }
  return path;
}

// Create directory if it doesn't exist
async function ensureDir(dir: string) {
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

// Load processed files record
function loadProcessedFiles(): Record<string, { mtime: number; size: number }> {
  if (existsSync(PROCESSED_FILES_LOG)) {
    try {
      return JSON.parse(readFileSync(PROCESSED_FILES_LOG, "utf-8"));
    } catch (e) {
      console.warn("⚠️  Could not read processed files log, starting fresh");
    }
  }
  return {};
}

// Save processed files record
function saveProcessedFiles(
  processed: Record<string, { mtime: number; size: number }>,
) {
  writeFileSync(PROCESSED_FILES_LOG, JSON.stringify(processed, null, 2));
}

// Check if file has changed since last processing
function hasFileChanged(
  filepath: string,
  processed: Record<string, { mtime: number; size: number }>,
): boolean {
  if (!processed[filepath]) return true;

  try {
    const stat = statSync(filepath);
    const mtime = stat.mtime.getTime();
    const size = stat.size;

    return (
      processed[filepath].mtime !== mtime || processed[filepath].size !== size
    );
  } catch (e) {
    return true; // If we can't stat it, assume it changed
  }
}

// Get all normalized CSV files in a directory tree
// Now works directly with Google Drive (expect latency)
function findNormalizedCsvFiles(dir: string): string[] {
  const files: string[] = [];

  function walk(currentDir: string, depth = 0) {
    // Only go 2 levels deep (prefecture/city)
    if (depth > 2) return;

    try {
      console.log(
        `🔍 Scanning ${currentDir.split("/").slice(-2).join("/")}... (this may take ~10s due to Google Drive latency)`,
      );
      const entries = readdirSync(currentDir);

      for (const entry of entries) {
        const fullPath = join(currentDir, entry);
        let stat: ReturnType<typeof statSync>;

        try {
          stat = statSync(fullPath);
        } catch (e) {
          console.warn(`⚠️  Could not stat ${entry}, skipping`);
          continue;
        }

        if (stat.isDirectory()) {
          walk(fullPath, depth + 1);
        } else if (
          stat.isFile() &&
          entry.endsWith("_normalized.csv") &&
          depth === 2 // Only get files at city level
        ) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${currentDir}:`, error);
    }
  }

  walk(dir);
  return files;
}

// Group files by prefecture/city
function groupFilesByLocation(
  files: string[],
  sourceDir: string,
): Map<string, { prefecture: string; city: string; files: string[] }> {
  const groups = new Map<
    string,
    { prefecture: string; city: string; files: string[] }
  >();

  for (const file of files) {
    // Get relative path from source directory
    const relativePath = file.substring(sourceDir.length + 1);
    const parts = relativePath.split("/");

    if (parts.length >= 2) {
      const prefecture = parts[0];
      const city = parts[1];
      const key = `${prefecture}/${city}`;

      if (!groups.has(key)) {
        groups.set(key, { prefecture, city, files: [] });
      }
      const group = groups.get(key);
      if (group) {
        group.files.push(file);
      }
    }
  }

  return groups;
}

// Select file from multiple options (automatically selects shortest)
async function selectFile(
  files: string[],
  prefecture: string,
  city: string,
): Promise<string | null> {
  if (files.length === 0) return null;
  if (files.length === 1) return files[0];

  let selectedFile: string;
  let selectionReason: string;

  // Check for priority files first
  const priorityFile = files.find((file) =>
    PRIORITY_FILES.includes(basename(file)),
  );

  if (priorityFile) {
    selectedFile = priorityFile;
    selectionReason = "priority file";
  } else {
    // Sort by filename length (shortest first)
    const sortedFiles = [...files].sort(
      (a, b) => basename(a).length - basename(b).length,
    );
    selectedFile = sortedFiles[0];
    selectionReason = "shortest filename";
  }

  // Log the choice
  let logEntry = `\n--- ${prefecture}/${city}\n`;

  // Sort files for display (by name for consistency)
  const displayFiles = [...files].sort((a, b) =>
    basename(a).localeCompare(basename(b)),
  );

  displayFiles.forEach((file, index) => {
    const filename = basename(file);
    const size = statSync(file).size;
    const isPriority = PRIORITY_FILES.includes(filename) ? " [PRIORITY]" : "";
    logEntry += `${index + 1}. ${filename} (${formatBytes(size)})${isPriority}\n`;
  });

  logEntry += `-> choose ${basename(selectedFile)} (${selectionReason})\n`;

  // Append to log file
  await appendFile(CHOICE_LOG_FILE, logEntry);

  // Also print to console
  console.log(
    `\n🤔 Multiple normalized CSV files found for ${prefecture}/${city}:`,
  );
  displayFiles.forEach((file, index) => {
    const filename = basename(file);
    const size = statSync(file).size;
    const isPriority = PRIORITY_FILES.includes(filename) ? " [PRIORITY]" : "";
    console.log(
      `  ${index + 1}. ${filename} (${formatBytes(size)})${isPriority}`,
    );
  });
  console.log(
    `📝 Automatically selecting: ${basename(selectedFile)} (${selectionReason})`,
  );

  return selectedFile;
}

// Format bytes to human readable
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Process a single CSV file with optional validation
async function processFile(
  csvFile: string,
  validateAll: boolean,
): Promise<boolean> {
  try {
    // Clear temp directory
    await rm(TEMP_DIR, { recursive: true, force: true });
    await ensureDir(TEMP_DIR);

    // Copy file to temp
    const tempFile = join(TEMP_DIR, basename(csvFile));
    console.log(
      "📋 Copying from Google Drive to temp... (this may take a moment)",
    );
    await copyFile(csvFile, tempFile);

    // Run load command with specific file to process it
    console.log(`\n📥 Processing ${basename(csvFile)}...`);
    execSync(`npm run poster:load-csv "${tempFile}"`, { stdio: "inherit" });

    if (validateAll) {
      // Validate ALL files by running load-csv without arguments
      console.log("\n🔍 Validating all loaded files...");
      execSync("npm run poster:load-csv", { stdio: "inherit" });
      console.log("✅ Successfully processed and validated!");
    } else {
      console.log("✅ Successfully processed!");
    }

    return true;
  } catch (error) {
    console.error("❌ Failed to process:", error);
    return false;
  }
}

// Copy file to destination
async function moveToDestination(
  csvFile: string,
  prefecture: string,
  success: boolean,
) {
  const destBase = success ? SUCCESS_DATA_DIR : BROKEN_DATA_DIR;
  const destDir = join(destBase, prefecture);
  await ensureDir(destDir);

  const destFile = join(destDir, basename(csvFile));
  console.log(
    `📋 Copying from Google Drive to ${destBase}... (this may take a moment)`,
  );
  await copyFile(csvFile, destFile);
  console.log(`📁 Copied to ${destFile}`);
}

// Main function
async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const validateAll = args.includes("--validate-all");

  console.log("🚀 Automated Poster Data Loader (Direct from Google Drive)");
  console.log("==========================================================");
  console.log(
    `Mode: ${validateAll ? "Validate all files after each load" : "Fast mode (no validation)"}\n`,
  );

  // Clean up existing data directories and processed files before processing
  console.log(
    "🧹 Cleaning up existing data directories and processed files...",
  );
  await rm(SUCCESS_DATA_DIR, { recursive: true, force: true });
  await rm(BROKEN_DATA_DIR, { recursive: true, force: true });
  await rm(PROCESSED_FILES_LOG, { force: true });
  console.log("✅ Cleanup complete\n");

  // Setup directories
  await ensureDir(BROKEN_DATA_DIR);
  await ensureDir(TEMP_DIR);

  // Load processed files record
  const processedFiles = loadProcessedFiles();

  // Initialize choice log with timestamp
  const timestamp = new Date().toISOString();
  await appendFile(CHOICE_LOG_FILE, `\n# Poster Data Choices - ${timestamp}\n`);

  // Check Google Drive path
  const sourcePath = expandTilde(SOURCE_PATH);
  if (!existsSync(sourcePath)) {
    console.error(`❌ Source path not found: ${sourcePath}`);
    console.error(
      "Please make sure Google Drive is mounted and the path is correct.",
    );
    process.exit(1);
  }

  console.log("📂 Working directory: Google Drive");
  console.log(`📍 Source: ${SOURCE_PATH}\n`);
  console.log(
    "⏳ Note: Google Drive operations may be slow (~10s per directory)\n",
  );

  // Find all normalized CSV files directly from Google Drive
  console.log("🔍 Searching for normalized CSV files in Google Drive...");
  const csvFiles = findNormalizedCsvFiles(sourcePath);
  console.log(`\n✅ Found ${csvFiles.length} normalized CSV files\n`);

  // Group by location
  const locationGroups = groupFilesByLocation(csvFiles, sourcePath);

  // Process each location one by one
  let successCount = 0;
  let failCount = 0;
  let unchangedCount = 0;

  for (const [location, group] of Array.from(locationGroups)) {
    console.log(`\n📍 Processing ${location}`);
    console.log("=".repeat(40));

    // Select file if multiple
    const selectedFile = await selectFile(
      group.files,
      group.prefecture,
      group.city,
    );
    if (!selectedFile) {
      console.log("⚠️  No file selected, skipping");
      continue;
    }

    // Check if file has changed
    if (!hasFileChanged(selectedFile, processedFiles)) {
      console.log(`⏭️  File hasn't changed since last run`);
      unchangedCount++;
      // continue; // DISABLED FOR NOW - process all files
    }

    // Process this file with optional validation
    const success = await processFile(selectedFile, validateAll);

    // Move to appropriate destination
    await moveToDestination(selectedFile, group.prefecture, success);

    // Update processed files record
    if (success) {
      const stat = statSync(selectedFile);
      processedFiles[selectedFile] = {
        mtime: stat.mtime.getTime(),
        size: stat.size,
      };
      successCount++;
    } else {
      failCount++;
    }
  }

  // Save processed files record
  saveProcessedFiles(processedFiles);

  // Summary
  console.log("\n📊 Summary");
  console.log("=".repeat(40));
  console.log(`✅ Successfully loaded: ${successCount}`);
  console.log(`❌ Failed to load: ${failCount}`);
  console.log(`⏭️  (unchanged): ${unchangedCount}`);
  console.log(`📁 Total files: ${successCount + failCount + unchangedCount}`);

  // Cleanup temp directory
  await rm(TEMP_DIR, { recursive: true, force: true });
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
