import * as fs from "node:fs";
import * as path from "node:path";
import { createServiceClient } from "@/lib/supabase/server";
import { Command } from "commander";
import * as yaml from "js-yaml";
import { v4 as uuidv4 } from "uuid";
import { getCategorySlugToIdMap, getMissionSlugToIdMap } from "./db";
import type { Category, CategoryLink, Mission } from "./types";

const program = new Command();

program
  .option(
    "--dry-run",
    "Show what would be changed without making actual changes",
  )
  .option(
    "--only <type>",
    "Sync only specific type: categories, missions, or links",
  )
  .parse(process.argv);

const options = program.opts();

async function loadYamlFile<T>(filename: string): Promise<T> {
  const filePath = path.join(__dirname, "..", filename);
  const content = fs.readFileSync(filePath, "utf8");
  return yaml.load(content) as T;
}

async function syncCategories(categories: Category[], dryRun: boolean) {
  console.log("\n📁 Syncing categories...");
  const supabase = await createServiceClient();

  for (const category of categories) {
    if (dryRun) {
      console.log(
        `  [DRY RUN] Would upsert category: ${category.slug} - ${category.title}`,
      );
    } else {
      // Check if category exists
      const { data: existing } = await supabase
        .from("mission_category")
        .select("id")
        .eq("slug", category.slug)
        .single();

      const categoryData = {
        id: existing?.id || uuidv4(),
        slug: category.slug,
        category_title: category.title,
        sort_no: category.sort_no,
        category_kbn: category.category_kbn,
      };

      const { error } = await supabase
        .from("mission_category")
        .upsert(categoryData);

      if (error) {
        console.error(`  ❌ Error upserting category ${category.slug}:`, error);
      } else {
        console.log(
          `  ✅ Upserted category: ${category.slug} - ${category.title}`,
        );
      }
    }
  }
}

async function syncMissions(missions: Mission[], dryRun: boolean) {
  console.log("\n📋 Syncing missions...");
  const supabase = await createServiceClient();

  for (const mission of missions) {
    if (dryRun) {
      console.log(
        `  [DRY RUN] Would upsert mission: ${mission.slug} - ${mission.title}`,
      );
    } else {
      // Check if mission exists
      const { data: existing } = await supabase
        .from("missions")
        .select("id")
        .eq("slug", mission.slug)
        .single();

      const missionData = {
        id: existing?.id || uuidv4(),
        slug: mission.slug,
        title: mission.title,
        icon_url: mission.icon_url,
        content: mission.content,
        difficulty: mission.difficulty,
        required_artifact_type: mission.required_artifact_type,
        max_achievement_count: mission.max_achievement_count,
        is_featured: mission.is_featured,
        is_hidden: mission.is_hidden,
        artifact_label: mission.artifact_label,
        ogp_image_url: mission.ogp_image_url,
        event_date: mission.event_date,
      };

      const { error } = await supabase.from("missions").upsert(missionData);

      if (error) {
        console.error(`  ❌ Error upserting mission ${mission.slug}:`, error);
      } else {
        console.log(
          `  ✅ Upserted mission: ${mission.slug} - ${mission.title}`,
        );
      }
    }
  }
}

async function syncCategoryLinks(
  categoryLinks: CategoryLink[],
  dryRun: boolean,
) {
  console.log("\n🔗 Syncing category links...");
  const supabase = await createServiceClient();

  const categoryMap = await getCategorySlugToIdMap();
  const missionMap = await getMissionSlugToIdMap();

  // First, delete all existing links if not dry run
  if (!dryRun) {
    const { error } = await supabase
      .from("mission_category_link")
      .delete()
      .neq("mission_id", "00000000-0000-0000-0000-000000000000"); // Delete all

    if (error) {
      console.error("  ❌ Error deleting existing links:", error);
      return;
    }
  }

  for (const categoryLink of categoryLinks) {
    const categoryId = categoryMap[categoryLink.category_slug];

    if (!categoryId) {
      console.error(`  ❌ Category not found: ${categoryLink.category_slug}`);
      continue;
    }

    for (const mission of categoryLink.missions) {
      const missionId = missionMap[mission.mission_slug];

      if (!missionId) {
        console.error(`  ❌ Mission not found: ${mission.mission_slug}`);
        continue;
      }

      if (dryRun) {
        console.log(
          `  [DRY RUN] Would link: ${mission.mission_slug} -> ${categoryLink.category_slug} (sort: ${mission.sort_no})`,
        );
      } else {
        const { error } = await supabase.from("mission_category_link").insert({
          mission_id: missionId,
          category_id: categoryId,
          sort_no: mission.sort_no,
        });

        if (error) {
          console.error(
            `  ❌ Error linking ${mission.mission_slug} to ${categoryLink.category_slug}:`,
            error,
          );
        } else {
          console.log(
            `  ✅ Linked: ${mission.mission_slug} -> ${categoryLink.category_slug} (sort: ${mission.sort_no})`,
          );
        }
      }
    }
  }
}

async function main() {
  try {
    console.log("🚀 Starting mission data sync...");
    console.log(`Mode: ${options.dryRun ? "DRY RUN" : "LIVE"}`);

    if (!options.only || options.only === "categories") {
      const { categories } = await loadYamlFile<{ categories: Category[] }>(
        "categories.yaml",
      );
      await syncCategories(categories, options.dryRun);
    }

    if (!options.only || options.only === "missions") {
      const { missions } = await loadYamlFile<{ missions: Mission[] }>(
        "missions.yaml",
      );
      await syncMissions(missions, options.dryRun);
    }

    if (!options.only || options.only === "links") {
      const { category_links } = await loadYamlFile<{
        category_links: CategoryLink[];
      }>("category_links.yaml");
      await syncCategoryLinks(category_links, options.dryRun);
    }

    console.log("\n✨ Sync completed!");
  } catch (error) {
    console.error("\n❌ Sync failed:", error);
    process.exit(1);
  }
}

main();
