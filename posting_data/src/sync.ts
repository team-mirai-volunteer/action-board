import * as fs from "node:fs";
import * as path from "node:path";
import { Command } from "commander";
import * as dotenv from "dotenv";
import * as yaml from "js-yaml";
import type { z } from "zod";
import { createAdminClient } from "@/lib/supabase/adminClient";
import { type PostingEvent, PostingEventDataSchema } from "./types";

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

async function syncPostingEvents(events: PostingEvent[], dryRun: boolean) {
  console.log("\n📮 Syncing posting events...");
  const supabase = await createAdminClient();

  for (const event of events) {
    if (dryRun) {
      console.log(
        `  [DRY RUN] Would upsert posting event: ${event.slug} - ${event.title} (active: ${event.is_active})`,
      );
    } else {
      // Check if event exists
      const { data: existing } = await supabase
        .from("posting_events")
        .select("id")
        .eq("slug", event.slug)
        .single();

      const eventData = {
        id: existing?.id || crypto.randomUUID(),
        slug: event.slug,
        title: event.title,
        description: event.description,
        is_active: event.is_active,
      };

      const { error } = await supabase.from("posting_events").upsert(eventData);

      if (error) {
        console.error(
          `  ❌ Error upserting posting event ${event.slug}:`,
          error,
        );
      } else {
        console.log(
          `  ✅ Upserted posting event: ${event.slug} - ${event.title} (active: ${event.is_active})`,
        );
      }
    }
  }
}

async function main() {
  try {
    console.log("🚀 Starting posting event data sync...");
    console.log(`Mode: ${options.dryRun ? "DRY RUN" : "LIVE"}`);

    const { posting_events } = loadYamlFile(
      "posting_events.yaml",
      PostingEventDataSchema,
    );
    await syncPostingEvents(posting_events, options.dryRun);

    console.log("\n✨ Sync completed!");
  } catch (error) {
    console.error("\n❌ Sync failed:", error);
    process.exit(1);
  }
}

main();
