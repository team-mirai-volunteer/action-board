import * as fs from "node:fs";
import * as path from "node:path";
import { createServiceClient } from "@/lib/supabase/server";
import { Command } from "commander";
import * as yaml from "js-yaml";
import { v4 as uuidv4 } from "uuid";
import {
  getCategorySlugToIdMap,
  getMissionSlugToIdMap,
  getQuizCategorySlugToIdMap,
} from "./db";
import type {
  Category,
  CategoryLink,
  Mission,
  MissionQuizLink,
  QuizCategory,
  QuizQuestion,
} from "./types";

const program = new Command();

program
  .option(
    "--dry-run",
    "Show what would be changed without making actual changes",
  )
  .option(
    "--only <type>",
    "Sync only specific type: categories, missions, links, quiz-categories, quiz-questions, or quiz-links",
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

async function syncQuizCategories(
  quizCategories: QuizCategory[],
  dryRun: boolean,
) {
  console.log("\n📚 Syncing quiz categories...");
  const supabase = await createServiceClient();

  for (const category of quizCategories) {
    if (dryRun) {
      console.log(
        `  [DRY RUN] Would upsert quiz category: ${category.slug} - ${category.name}`,
      );
    } else {
      // Check if category exists
      const { data: existing } = await supabase
        .from("quiz_categories")
        .select("id")
        .eq("slug", category.slug)
        .single();

      const categoryData = {
        id: existing?.id || uuidv4(),
        slug: category.slug,
        name: category.name,
        description: category.description,
        display_order: category.display_order,
        is_active: category.is_active,
      };

      const { error } = await supabase
        .from("quiz_categories")
        .upsert(categoryData);

      if (error) {
        console.error(
          `  ❌ Error upserting quiz category ${category.slug}:`,
          error,
        );
      } else {
        console.log(
          `  ✅ Upserted quiz category: ${category.slug} - ${category.name}`,
        );
      }
    }
  }
}

async function syncQuizQuestions(
  quizQuestions: QuizQuestion[],
  dryRun: boolean,
) {
  console.log("\n❓ Syncing quiz questions...");
  const supabase = await createServiceClient();

  const categoryMap = await getQuizCategorySlugToIdMap();
  const missionMap = await getMissionSlugToIdMap();

  for (const question of quizQuestions) {
    const categoryId = categoryMap[question.category_slug];

    if (!categoryId) {
      console.error(`  ❌ Quiz category not found: ${question.category_slug}`);
      continue;
    }

    const missionId = question.mission_slug
      ? missionMap[question.mission_slug]
      : null;

    if (question.mission_slug && !missionId) {
      console.error(`  ❌ Mission not found: ${question.mission_slug}`);
      continue;
    }

    if (dryRun) {
      console.log(
        `  [DRY RUN] Would upsert quiz question: ${question.id} - ${question.question.substring(0, 50)}...`,
      );
    } else {
      const questionData = {
        id: question.id,
        category_id: categoryId,
        mission_id: missionId,
        question: question.question,
        option1: question.option1,
        option2: question.option2,
        option3: question.option3,
        option4: question.option4,
        correct_answer: question.correct_answer,
        explanation: question.explanation,
        question_order: question.question_order,
        is_active: question.is_active,
      };

      const { error } = await supabase
        .from("quiz_questions")
        .upsert(questionData);

      if (error) {
        console.error(
          `  ❌ Error upserting quiz question ${question.id}:`,
          error,
        );
      } else {
        console.log(
          `  ✅ Upserted quiz question: ${question.id} - ${question.question.substring(0, 50)}...`,
        );
      }
    }
  }
}

async function syncMissionQuizLinks(
  missionQuizLinks: MissionQuizLink[],
  dryRun: boolean,
) {
  console.log("\n🔗 Syncing mission quiz links...");
  const supabase = await createServiceClient();

  const missionMap = await getMissionSlugToIdMap();

  // First, delete all existing links if not dry run
  if (!dryRun) {
    const { error } = await supabase
      .from("mission_quiz_links")
      .delete()
      .neq("mission_id", "00000000-0000-0000-0000-000000000000"); // Delete all

    if (error) {
      console.error("  ❌ Error deleting existing quiz links:", error);
      return;
    }
  }

  for (const link of missionQuizLinks) {
    const missionId = missionMap[link.mission_slug];

    if (!missionId) {
      console.error(`  ❌ Mission not found: ${link.mission_slug}`);
      continue;
    }

    if (dryRun) {
      console.log(
        `  [DRY RUN] Would create quiz link: ${link.mission_slug} -> ${link.link}`,
      );
    } else {
      const { error } = await supabase.from("mission_quiz_links").insert({
        id: uuidv4(),
        mission_id: missionId,
        link: link.link,
        remark: link.remark,
        display_order: link.display_order,
      });

      if (error) {
        console.error(
          `  ❌ Error creating quiz link for ${link.mission_slug}:`,
          error,
        );
      } else {
        console.log(
          `  ✅ Created quiz link: ${link.mission_slug} -> ${link.link}`,
        );
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

    if (!options.only || options.only === "quiz-categories") {
      const { quiz_categories } = await loadYamlFile<{
        quiz_categories: QuizCategory[];
      }>("quiz_categories.yaml");
      await syncQuizCategories(quiz_categories, options.dryRun);
    }

    if (!options.only || options.only === "quiz-questions") {
      const { quiz_questions } = await loadYamlFile<{
        quiz_questions: QuizQuestion[];
      }>("quiz_questions.yaml");
      await syncQuizQuestions(quiz_questions, options.dryRun);
    }

    if (!options.only || options.only === "quiz-links") {
      const { mission_quiz_links } = await loadYamlFile<{
        mission_quiz_links: MissionQuizLink[];
      }>("mission_quiz_links.yaml");
      await syncMissionQuizLinks(mission_quiz_links, options.dryRun);
    }

    console.log("\n✨ Sync completed!");
  } catch (error) {
    console.error("\n❌ Sync failed:", error);
    process.exit(1);
  }
}

main();
