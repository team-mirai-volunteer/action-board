import * as fs from "node:fs";
import * as path from "node:path";
import { createServiceClient } from "@/lib/supabase/server";
import { Command } from "commander";
import * as yaml from "js-yaml";

const program = new Command();

program
  .option(
    "--only <type>",
    "Export only specific type: categories, missions, links, quiz-categories, quiz-questions, quiz-links, or main-links",
  )
  .parse(process.argv);

const options = program.opts();

async function exportCategories() {
  console.log("\n📁 Exporting categories...");
  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from("mission_category")
    .select("*")
    .order("sort_no");

  if (error) {
    throw error;
  }

  const categories = data.map((item) => ({
    slug: item.slug,
    title: item.category_title,
    sort_no: item.sort_no,
    category_kbn: item.category_kbn,
  }));

  const yamlContent = yaml.dump({ categories }, { lineWidth: -1 });
  const filePath = path.join(__dirname, "..", "categories.yaml");
  fs.writeFileSync(filePath, yamlContent);

  console.log(`  ✅ Exported ${categories.length} categories`);
}

async function exportMissions() {
  console.log("\n📋 Exporting missions...");
  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from("missions")
    .select("*")
    .order("slug");

  if (error) {
    throw error;
  }

  const missions = data.map((item) => ({
    slug: item.slug,
    title: item.title,
    icon_url: item.icon_url,
    content: item.content,
    difficulty: item.difficulty,
    required_artifact_type: item.required_artifact_type,
    max_achievement_count: item.max_achievement_count,
    is_featured: item.is_featured,
    is_hidden: item.is_hidden,
    artifact_label: item.artifact_label,
    ogp_image_url: item.ogp_image_url,
    event_date: item.event_date,
  }));

  const yamlContent = yaml.dump({ missions }, { lineWidth: -1 });
  const filePath = path.join(__dirname, "..", "missions.yaml");
  fs.writeFileSync(filePath, yamlContent);

  console.log(`  ✅ Exported ${missions.length} missions`);
}

async function exportCategoryLinks() {
  console.log("\n🔗 Exporting category links...");
  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from("mission_category_link")
    .select(`
      mission_id,
      category_id,
      sort_no,
      missions!inner(slug),
      mission_category!inner(slug)
    `)
    .order("category_id")
    .order("sort_no");

  if (error) {
    throw error;
  }

  // Group by category
  const linksByCategory = data.reduce(
    (acc, item) => {
      const categorySlug = item.mission_category.slug;
      if (!acc[categorySlug]) {
        acc[categorySlug] = [];
      }
      acc[categorySlug].push({
        mission_slug: item.missions.slug,
        sort_no: item.sort_no,
      });
      return acc;
    },
    {} as Record<string, Array<{ mission_slug: string; sort_no: number }>>,
  );

  const categoryLinks = Object.entries(linksByCategory).map(
    ([category_slug, missions]) => ({
      category_slug,
      missions,
    }),
  );

  const yamlContent = yaml.dump(
    { category_links: categoryLinks },
    { lineWidth: -1 },
  );
  const filePath = path.join(__dirname, "..", "category_links.yaml");
  fs.writeFileSync(filePath, yamlContent);

  console.log(`  ✅ Exported ${categoryLinks.length} category links`);
}

async function exportQuizCategories() {
  console.log("\n📚 Exporting quiz categories...");
  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from("quiz_categories")
    .select("*")
    .order("display_order");

  if (error) {
    throw error;
  }

  const quizCategories = data.map((item) => ({
    slug: item.slug,
    name: item.name,
    description: item.description,
    display_order: item.display_order,
    is_active: item.is_active,
  }));

  const yamlContent = yaml.dump(
    { quiz_categories: quizCategories },
    { lineWidth: -1 },
  );
  const filePath = path.join(__dirname, "..", "quiz_categories.yaml");
  fs.writeFileSync(filePath, yamlContent);

  console.log(`  ✅ Exported ${quizCategories.length} quiz categories`);
}

async function exportQuizQuestions() {
  console.log("\n❓ Exporting quiz questions...");
  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from("quiz_questions")
    .select(`
      *,
      quiz_categories!inner(slug),
      missions(slug)
    `)
    .order("question_order");

  if (error) {
    throw error;
  }

  const quizQuestions = data.map((item) => ({
    id: item.id,
    category_slug: item.quiz_categories.slug,
    mission_slug: item.missions?.slug || null,
    question: item.question,
    option1: item.option1,
    option2: item.option2,
    option3: item.option3,
    option4: item.option4,
    correct_answer: item.correct_answer,
    explanation: item.explanation,
    question_order: item.question_order,
    is_active: item.is_active,
  }));

  const yamlContent = yaml.dump(
    { quiz_questions: quizQuestions },
    { lineWidth: -1 },
  );
  const filePath = path.join(__dirname, "..", "quiz_questions.yaml");
  fs.writeFileSync(filePath, yamlContent);

  console.log(`  ✅ Exported ${quizQuestions.length} quiz questions`);
}

async function exportMissionQuizLinks() {
  console.log("\n🔗 Exporting mission quiz links...");
  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from("mission_quiz_links")
    .select(`
      *,
      missions!inner(slug)
    `)
    .order("display_order");

  if (error) {
    throw error;
  }

  const missionQuizLinks = data.map((item) => ({
    mission_slug: item.missions.slug,
    link: item.link,
    remark: item.remark,
    display_order: item.display_order,
  }));

  const yamlContent = yaml.dump(
    { mission_quiz_links: missionQuizLinks },
    { lineWidth: -1 },
  );
  const filePath = path.join(__dirname, "..", "mission_quiz_links.yaml");
  fs.writeFileSync(filePath, yamlContent);

  console.log(`  ✅ Exported ${missionQuizLinks.length} mission quiz links`);
}

async function exportMissionMainLinks() {
  console.log("\n🔗 Exporting mission main links...");
  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from("mission_main_links")
    .select(`
      *,
      missions!inner(slug)
    `)
    .order("missions(slug)");

  if (error) {
    throw error;
  }

  const missionMainLinks = data.map((item) => ({
    mission_slug: item.missions.slug,
    label: item.label,
    link: item.link,
  }));

  const yamlContent = yaml.dump(
    { mission_main_links: missionMainLinks },
    { lineWidth: -1 },
  );
  const filePath = path.join(__dirname, "..", "mission_main_links.yaml");
  fs.writeFileSync(filePath, yamlContent);

  console.log(`  ✅ Exported ${missionMainLinks.length} mission main links`);
}

async function main() {
  try {
    console.log("🚀 Starting mission data export...");

    if (!options.only || options.only === "categories") {
      await exportCategories();
    }

    if (!options.only || options.only === "missions") {
      await exportMissions();
    }

    if (!options.only || options.only === "links") {
      await exportCategoryLinks();
    }

    if (!options.only || options.only === "quiz-categories") {
      await exportQuizCategories();
    }

    if (!options.only || options.only === "quiz-questions") {
      await exportQuizQuestions();
    }

    if (!options.only || options.only === "quiz-links") {
      await exportMissionQuizLinks();
    }

    if (!options.only || options.only === "main-links") {
      await exportMissionMainLinks();
    }

    console.log("\n✨ Export completed!");
  } catch (error) {
    console.error("\n❌ Export failed:", error);
    process.exit(1);
  }
}

main();
