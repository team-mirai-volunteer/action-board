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

const SOURCE_PATH =
  "~/Google Drive/Shared drives/チームはやま(外部共有)/ポスター・ポスティングロジ/ポスター・ポスティング作業用/ポスター/ポスター掲示場CSV化/自治体";
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

// File type definitions
type FileType = "normalized" | "append";

interface CsvFiles {
  normalized: string[];
  append: string[];
}

// Get all CSV files in a directory tree by type
// Now works directly with Google Drive (expect latency)
function findCsvFiles(dir: string): CsvFiles {
  const files: CsvFiles = {
    normalized: [],
    append: [],
  };

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
        } else if (stat.isFile() && depth === 2) {
          // Only get files at city level
          if (entry.endsWith("_normalized.csv")) {
            files.normalized.push(fullPath);
          } else if (entry.endsWith("append.csv")) {
            files.append.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${currentDir}:`, error);
    }
  }

  walk(dir);
  return files;
}

interface LocationGroup {
  prefecture: string;
  city: string;
  files: CsvFiles;
}

// Group files by prefecture/city
function groupFilesByLocation(
  csvFiles: CsvFiles,
  sourceDir: string,
): Map<string, LocationGroup> {
  const groups = new Map<string, LocationGroup>();

  // Helper to add file to group
  const addFileToGroup = (file: string, fileType: FileType) => {
    const relativePath = file.substring(sourceDir.length + 1);
    const parts = relativePath.split("/");

    if (parts.length >= 2) {
      const prefecture = parts[0];
      const city = parts[1];
      const key = `${prefecture}/${city}`;

      if (!groups.has(key)) {
        groups.set(key, {
          prefecture,
          city,
          files: { normalized: [], append: [] },
        });
      }
      const group = groups.get(key);
      if (group) {
        group.files[fileType].push(file);
      }
    }
  };

  // Process normalized files
  for (const file of csvFiles.normalized) {
    addFileToGroup(file, "normalized");
  }

  // Process append files
  for (const file of csvFiles.append) {
    addFileToGroup(file, "append");
  }

  return groups;
}

// Selection strategies for different file types
interface SelectionResult {
  file: string;
  reason: string;
}

// Select normalized file based on priority or shortest name
function selectNormalizedFile(files: string[]): SelectionResult | null {
  if (files.length === 0) return null;
  if (files.length === 1) return { file: files[0], reason: "only file" };

  // Check for priority files first
  const priorityFile = files.find((file) =>
    PRIORITY_FILES.includes(basename(file)),
  );

  if (priorityFile) {
    return { file: priorityFile, reason: "priority file" };
  }

  // Sort by filename length (shortest first)
  const sortedFiles = [...files].sort(
    (a, b) => basename(a).length - basename(b).length,
  );

  return { file: sortedFiles[0], reason: "shortest filename" };
}

// Select append files - returns all of them
function selectAppendFiles(files: string[]): string[] {
  // For append files, we want to load all of them
  return files;
}

// Generic file selection with logging
async function selectCsvFiles(
  fileType: FileType,
  files: string[],
  prefecture: string,
  city: string,
): Promise<{ selected: string | null; all: string[] }> {
  if (fileType === "append") {
    // For append files, return all
    return { selected: null, all: selectAppendFiles(files) };
  }

  // For normalized files, use selection strategy
  const selection = selectNormalizedFile(files);
  if (!selection) {
    return { selected: null, all: [] };
  }

  // Log the choice for normalized files with multiple options
  if (files.length > 1) {
    await logFileSelection(files, selection, prefecture, city);
  }

  return { selected: selection.file, all: [selection.file] };
}

// Log file selection to choice.md
async function logFileSelection(
  files: string[],
  selection: SelectionResult,
  prefecture: string,
  city: string,
): Promise<void> {
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

  logEntry += `-> choose ${basename(selection.file)} (${selection.reason})\n`;

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
    `📝 Automatically selecting: ${basename(selection.file)} (${selection.reason})`,
  );
}

// Log append files
async function logAppendFiles(
  files: string[],
  prefecture: string,
  city: string,
): Promise<void> {
  if (files.length === 0) return;

  let logEntry = "\n📎 Append files to be loaded:\n";
  for (const file of files) {
    const filename = basename(file);
    const size = statSync(file).size;
    logEntry += `  + ${filename} (${formatBytes(size)})\n`;
  }

  await appendFile(CHOICE_LOG_FILE, logEntry);

  console.log(`\n📎 Also loading ${files.length} append file(s):`);
  for (const file of files) {
    const filename = basename(file);
    const size = statSync(file).size;
    console.log(`  + ${filename} (${formatBytes(size)})`);
  }
}

// Format bytes to human readable
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Process multiple CSV files with optional validation
async function processFiles(
  files: string[],
  validateAll: boolean,
): Promise<boolean> {
  if (files.length === 0) return true;

  try {
    // Clear temp directory
    await rm(TEMP_DIR, { recursive: true, force: true });
    await ensureDir(TEMP_DIR);

    // Process each file
    for (const csvFile of files) {
      const tempFile = join(TEMP_DIR, basename(csvFile));
      const isAppend = basename(csvFile).endsWith("append.csv");

      console.log(
        `\n📋 Copying ${isAppend ? "append" : "main"} file from Google Drive to temp...`,
      );
      await copyFile(csvFile, tempFile);

      console.log(
        `\n${isAppend ? "📎" : "📥"} Processing ${basename(csvFile)}...`,
      );
      execSync(`npm run poster:load-csv "${tempFile}"`, { stdio: "inherit" });
    }

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

// Copy files to destination
async function moveFilesToDestination(
  files: string[],
  prefecture: string,
  success: boolean,
) {
  if (files.length === 0) return;

  const destBase = success ? SUCCESS_DATA_DIR : BROKEN_DATA_DIR;
  const destDir = join(destBase, prefecture);
  await ensureDir(destDir);

  for (const csvFile of files) {
    const destFile = join(destDir, basename(csvFile));
    const isAppend = basename(csvFile).endsWith("append.csv");

    console.log(
      `📋 Copying ${isAppend ? "append" : "main"} file from Google Drive to ${destBase}...`,
    );
    await copyFile(csvFile, destFile);
    console.log(`📁 Copied to ${destFile}`);
  }
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

  // Find all CSV files directly from Google Drive
  console.log("🔍 Searching for CSV files in Google Drive...");
  const csvFiles = findCsvFiles(sourcePath);
  console.log(`\n✅ Found ${csvFiles.normalized.length} normalized CSV files`);
  console.log(`📎 Found ${csvFiles.append.length} append CSV files\n`);

  // Group by location
  const locationGroups = groupFilesByLocation(csvFiles, sourcePath);

  // Process each location one by one
  let successCount = 0;
  let failCount = 0;
  let unchangedCount = 0;

  for (const [location, group] of Array.from(locationGroups)) {
    console.log(`\n📍 Processing ${location}`);
    console.log("=".repeat(40));

    // Select normalized files
    const normalizedResult = await selectCsvFiles(
      "normalized",
      group.files.normalized,
      group.prefecture,
      group.city,
    );

    if (!normalizedResult.selected) {
      console.log("⚠️  No normalized file selected, skipping location");
      continue;
    }

    // Get all append files for this location
    const appendResult = await selectCsvFiles(
      "append",
      group.files.append,
      group.prefecture,
      group.city,
    );

    // Log append files if any
    await logAppendFiles(appendResult.all, group.prefecture, group.city);

    // Combine all files to process
    const allFiles = [...normalizedResult.all, ...appendResult.all];

    // Check if any file has changed
    const hasChanged = allFiles.some((file) =>
      hasFileChanged(file, processedFiles),
    );
    if (!hasChanged) {
      console.log(`⏭️  Files haven't changed since last run`);
      unchangedCount++;
      // continue; // DISABLED FOR NOW - process all files
    }

    // Process all files with optional validation
    const success = await processFiles(allFiles, validateAll);

    // Move to appropriate destination
    await moveFilesToDestination(allFiles, group.prefecture, success);

    // Update processed files record
    if (success) {
      for (const file of allFiles) {
        const stat = statSync(file);
        processedFiles[file] = {
          mtime: stat.mtime.getTime(),
          size: stat.size,
        };
      }
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
