#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

// Output directory for Cloudflare deployment
const OUTPUT_DIR = ".cloudflare-output";

// Clean and create output directory
if (fs.existsSync(OUTPUT_DIR)) {
  console.log(`🗑️  Cleaning existing ${OUTPUT_DIR} directory...`);
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
}
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Copy function with directory creation
function copyRecursiveSync(source, target) {
  const stats = fs.statSync(source);

  if (stats.isDirectory()) {
    if (!fs.existsSync(target)) {
      fs.mkdirSync(target, { recursive: true });
    }

    const files = fs.readdirSync(source);
    for (const file of files) {
      const srcPath = path.join(source, file);
      const targetPath = path.join(target, file);
      copyRecursiveSync(srcPath, targetPath);
    }
  } else {
    // Ensure target directory exists
    const targetDir = path.dirname(target);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    fs.copyFileSync(source, target);
  }
}

console.log("📦 Preparing Cloudflare deployment files...");

// Copy static assets (client-side bundles)
if (fs.existsSync(".next/static")) {
  console.log("  ✓ Copying static assets...");
  copyRecursiveSync(".next/static", path.join(OUTPUT_DIR, "_next/static"));
}

// Copy server files (excluding app chunks we don't need)
if (fs.existsSync(".next/server")) {
  console.log("  ✓ Copying server files...");
  copyRecursiveSync(".next/server", path.join(OUTPUT_DIR, "_next/server"));
}

// Copy public directory
if (fs.existsSync("public")) {
  console.log("  ✓ Copying public assets...");
  const publicFiles = fs.readdirSync("public");
  for (const file of publicFiles) {
    const srcPath = path.join("public", file);
    const targetPath = path.join(OUTPUT_DIR, file);
    copyRecursiveSync(srcPath, targetPath);
  }
}

// Copy essential Next.js files
const essentialFiles = [
  "BUILD_ID",
  "app-build-manifest.json",
  "app-path-routes-manifest.json",
  "build-manifest.json",
  "export-marker.json",
  "images-manifest.json",
  "next-minimal-server.js.nft.json",
  "next-server.js.nft.json",
  "prerender-manifest.json",
  "react-loadable-manifest.json",
  "required-server-files.json",
  "routes-manifest.json",
];

console.log("  ✓ Copying manifest files...");
for (const file of essentialFiles) {
  const srcPath = path.join(".next", file);
  const targetPath = path.join(OUTPUT_DIR, "_next", file);

  if (fs.existsSync(srcPath)) {
    // Ensure _next directory exists
    const nextDir = path.join(OUTPUT_DIR, "_next");
    if (!fs.existsSync(nextDir)) {
      fs.mkdirSync(nextDir, { recursive: true });
    }
    fs.copyFileSync(srcPath, targetPath);
  }
}

// Create a simple package.json for Cloudflare
const packageJson = {
  name: "action-board-cloudflare",
  version: "1.0.0",
  private: true,
};

fs.writeFileSync(
  path.join(OUTPUT_DIR, "package.json"),
  JSON.stringify(packageJson, null, 2),
);

// Calculate total size
function getDirectorySize(dirPath) {
  let totalSize = 0;

  function calculateSize(currentPath) {
    const stats = fs.statSync(currentPath);

    if (stats.isFile()) {
      totalSize += stats.size;
    } else if (stats.isDirectory()) {
      const files = fs.readdirSync(currentPath);
      for (const file of files) {
        calculateSize(path.join(currentPath, file));
      }
    }
  }

  calculateSize(dirPath);
  return totalSize;
}

const totalSize = getDirectorySize(OUTPUT_DIR);
const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);

console.log("\n✅ Cloudflare deployment prepared successfully!");
console.log(`📊 Total size: ${sizeMB} MB`);
console.log(`📁 Output directory: ${OUTPUT_DIR}/`);
console.log(`\n🚀 Ready to deploy with: wrangler pages deploy ${OUTPUT_DIR}`);
