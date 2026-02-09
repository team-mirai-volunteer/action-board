import * as fs from "node:fs";
import * as path from "node:path";
import { Command } from "commander";
import * as dotenv from "dotenv";
import * as yaml from "js-yaml";
import type { z } from "zod";
import { createAdminClient } from "@/lib/supabase/adminClient";
import { type Season, SeasonDataSchema } from "./types";

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const program = new Command();

program
  .option(
    "--dry-run",
    "Show what would be changed without making actual changes",
  )
  .parse(process.argv);

const options = program.opts();

function loadYamlFile<T>(filename: string, schema: z.ZodType<T>): T {
  const filePath = path.join(__dirname, "..", filename);
  const content = fs.readFileSync(filePath, "utf8");
  const parsed = yaml.load(content);

  const result = schema.safeParse(parsed);
  if (!result.success) {
    console.error(`❌ Validation error in ${filename}:`);
    for (const issue of result.error.issues) {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
    throw new Error(`Invalid YAML structure in ${filename}`);
  }

  return result.data;
}

async function syncSeasons(seasons: Season[], dryRun: boolean) {
  console.log("\n🏆 Syncing seasons...");
  const supabase = await createAdminClient();

  for (const season of seasons) {
    if (dryRun) {
      console.log(
        `  [DRY RUN] Would upsert season: ${season.slug} - ${season.name} (active: ${season.is_active})`,
      );
    } else {
      // Check if season exists
      const { data: existing } = await supabase
        .from("seasons")
        .select("id")
        .eq("slug", season.slug)
        .single();

      const seasonData = {
        id: existing?.id || crypto.randomUUID(),
        slug: season.slug,
        name: season.name,
        start_date: season.start_date,
        end_date: season.end_date,
        is_active: season.is_active,
      };

      const { error } = await supabase.from("seasons").upsert(seasonData);

      if (error) {
        console.error(`  ❌ Error upserting season ${season.slug}:`, error);
      } else {
        console.log(
          `  ✅ Upserted season: ${season.slug} - ${season.name} (active: ${season.is_active})`,
        );
      }
    }
  }
}

async function main() {
  try {
    console.log("🚀 Starting season data sync...");
    console.log(`Mode: ${options.dryRun ? "DRY RUN" : "LIVE"}`);

    const { seasons } = loadYamlFile("seasons.yaml", SeasonDataSchema);
    await syncSeasons(seasons, options.dryRun);

    console.log("\n✨ Sync completed!");
  } catch (error) {
    console.error("\n❌ Sync failed:", error);
    process.exit(1);
  }
}

main();
