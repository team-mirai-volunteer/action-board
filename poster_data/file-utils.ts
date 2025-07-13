import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

/**
 * Calculate SHA-256 hash of file content
 */
export function getFileContentHash(filePath: string): string | null {
  if (!existsSync(filePath)) {
    return null;
  }

  try {
    const content = readFileSync(filePath, "utf-8");
    return createHash("sha256").update(content).digest("hex");
  } catch (error) {
    console.warn(`⚠️  Could not read file for hashing: ${filePath}`, error);
    return null;
  }
}

/**
 * Calculate SHA-256 hash of string content
 */
export function getStringContentHash(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

/**
 * Check if file content would change if we wrote the new content
 */
export function wouldFileContentChange(
  filePath: string,
  newContent: string,
): boolean {
  const existingHash = getFileContentHash(filePath);
  if (existingHash === null) {
    return true;
  }

  const newHash = getStringContentHash(newContent);
  return existingHash !== newHash;
}

/**
 * Check if two files have the same content
 */
export function filesHaveSameContent(
  filePath1: string,
  filePath2: string,
): boolean {
  const hash1 = getFileContentHash(filePath1);
  const hash2 = getFileContentHash(filePath2);

  if (hash1 === null || hash2 === null) {
    return false;
  }

  return hash1 === hash2;
}
