#!/usr/bin/env node

/**
 * Environment Variable Validation Script for Cloudflare Pages Deployment
 * This script checks that all required environment variables are set before building
 */

const requiredEnvVars = [
  // Supabase Configuration (Required)
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",

  // Optional but recommended for full functionality
  // 'SUPABASE_SERVICE_ROLE_KEY',
  // 'NEXT_PUBLIC_GA_ID',
  // 'NEXT_PUBLIC_SENTRY_DSN',
  // 'LINE_CLIENT_SECRET',
  // 'NEXT_PUBLIC_LINE_CLIENT_ID',
  // 'BATCH_ADMIN_KEY',
];

const warnings = [];
const errors = [];

// Check required variables
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    errors.push(`❌ Missing required environment variable: ${varName}`);
  } else {
    console.log(`✅ ${varName} is set`);
  }
}

// Check optional but recommended variables
const recommendedVars = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_APP_ORIGIN",
  "SITE_URL",
];

for (const varName of recommendedVars) {
  if (!process.env[varName]) {
    warnings.push(`⚠️  Missing recommended environment variable: ${varName}`);
  }
}

// Output results
if (warnings.length > 0) {
  console.log("\n⚠️  Warnings:");
  for (const warning of warnings) {
    console.log(warning);
  }
}

if (errors.length > 0) {
  console.log("\n❌ Errors found:");
  for (const error of errors) {
    console.log(error);
  }
  console.log(
    "\n📚 Please set the required environment variables in your Cloudflare Pages dashboard:",
  );
  console.log("   1. Go to your Cloudflare Pages project settings");
  console.log("   2. Navigate to Settings > Environment variables");
  console.log(
    "   3. Add the missing variables for your environment (production/preview)",
  );
  console.log(
    "   4. Refer to .env.cloudflare for the complete list of variables",
  );
  process.exit(1);
}

console.log("\n✅ All required environment variables are set!");
console.log("🚀 Proceeding with build...\n");
