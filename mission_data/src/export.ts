import * as fs from "node:fs";
import * as path from "node:path";
import { createServiceClient } from "@/lib/supabase/server";
import * as dotenv from "dotenv";
import * as yaml from "js-yaml";
import type {
  Category,
  CategoryLink,
  Mission,
  MissionQuizLink,
  QuizCategory,
  QuizQuestion,
} from "./types";

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function exportCategories() {
  console.log("📁 Exporting categories...");
  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from("mission_category")
    .select("*")
    .order("sort_no");

  if (error) throw error;

  const categories: Category[] = data.map((cat) => ({
    slug: cat.slug,
    title: cat.category_title,
    sort_no: cat.sort_no,
    category_kbn: cat.category_kbn,
  }));

  const yamlContent = yaml.dump(
    { categories },
    {
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
    },
  );

  const filePath = path.join(__dirname, "..", "categories.yaml");
  fs.writeFileSync(filePath, yamlContent);
  console.log(
    `  ✅ Exported ${categories.length} categories to categories.yaml`,
  );
}

async function exportMissions() {
  console.log("📋 Exporting missions...");
  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from("missions")
    .select("*")
    .order("created_at");

  if (error) throw error;

  const missions: Mission[] = data.map((mission) => ({
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
  }));

  const yamlContent = yaml.dump(
    { missions },
    {
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
    },
  );

  const filePath = path.join(__dirname, "..", "missions.yaml");
  fs.writeFileSync(filePath, yamlContent);
  console.log(`  ✅ Exported ${missions.length} missions to missions.yaml`);
}

async function exportCategoryLinks() {
  console.log("🔗 Exporting category links...");
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

  if (error) throw error;

  // Group by category
  const linksByCategory: Record<
    string,
    Array<CategoryLink["missions"][number]>
  > = {};

  for (const link of data) {
    const categorySlug = link.mission_category.slug;
    if (!linksByCategory[categorySlug]) {
      linksByCategory[categorySlug] = [];
    }
    linksByCategory[categorySlug].push({
      mission_slug: link.missions.slug,
      sort_no: link.sort_no,
    });
  }

  const categoryLinks: CategoryLink[] = Object.entries(linksByCategory).map(
    ([categorySlug, missions]) => ({
      category_slug: categorySlug,
      missions: missions,
    }),
  );

  const yamlContent = yaml.dump(
    { category_links: categoryLinks },
    {
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
    },
  );

  const filePath = path.join(__dirname, "..", "category_links.yaml");
  fs.writeFileSync(filePath, yamlContent);
  console.log("  ✅ Exported category links to category_links.yaml");
}

async function exportQuizCategories() {
  console.log("📚 Exporting quiz categories...");
  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from("quiz_categories")
    .select("slug, name, description, display_order, is_active")
    .eq("is_active", true)
    .order("display_order");

  if (error) throw error;

  const quizCategories: QuizCategory[] = data.map((cat) => ({
    slug: cat.slug,
    name: cat.name,
    description: cat.description,
    display_order: cat.display_order,
    is_active: cat.is_active,
  }));

  const yamlContent = yaml.dump(
    { quiz_categories: quizCategories },
    {
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
    },
  );

  const filePath = path.join(__dirname, "..", "quiz_categories.yaml");
  fs.writeFileSync(filePath, yamlContent);
  console.log(
    `  ✅ Exported ${quizCategories.length} quiz categories to quiz_categories.yaml`,
  );
}

async function exportQuizQuestions() {
  console.log("❓ Exporting quiz questions...");
  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from("quiz_questions")
    .select(`
      id,
      category_id,
      mission_id,
      question,
      option1,
      option2,
      option3,
      option4,
      correct_answer,
      explanation,
      question_order,
      is_active,
      quiz_categories!inner(slug),
      missions(slug)
    `)
    .eq("is_active", true)
    .order("category_id")
    .order("question_order");

  if (error) throw error;

  const quizQuestions: QuizQuestion[] = data.map((q) => ({
    id: q.id,
    category_slug: q.quiz_categories.slug,
    mission_slug: q.missions?.slug || null,
    question: q.question,
    option1: q.option1,
    option2: q.option2,
    option3: q.option3,
    option4: q.option4,
    correct_answer: q.correct_answer,
    explanation: q.explanation,
    question_order: q.question_order,
    is_active: q.is_active,
  }));

  const yamlContent = yaml.dump(
    { quiz_questions: quizQuestions },
    {
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
    },
  );

  const filePath = path.join(__dirname, "..", "quiz_questions.yaml");
  fs.writeFileSync(filePath, yamlContent);
  console.log(
    `  ✅ Exported ${quizQuestions.length} quiz questions to quiz_questions.yaml`,
  );
}

async function exportMissionQuizLinks() {
  console.log("🔗 Exporting mission quiz links...");
  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from("mission_quiz_links")
    .select(`
      mission_id,
      link,
      remark,
      display_order,
      missions!inner(slug)
    `)
    .order("mission_id")
    .order("display_order");

  if (error) throw error;

  const missionQuizLinks: MissionQuizLink[] = data.map((link) => ({
    mission_slug: link.missions.slug,
    link: link.link,
    remark: link.remark,
    display_order: link.display_order,
  }));

  const yamlContent = yaml.dump(
    { mission_quiz_links: missionQuizLinks },
    {
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
    },
  );

  const filePath = path.join(__dirname, "..", "mission_quiz_links.yaml");
  fs.writeFileSync(filePath, yamlContent);
  console.log(
    `  ✅ Exported ${missionQuizLinks.length} mission quiz links to mission_quiz_links.yaml`,
  );
}

async function main() {
  try {
    console.log("🚀 Starting data export from database...\n");

    await exportCategories();
    await exportMissions();
    await exportCategoryLinks();
    await exportQuizCategories();
    await exportQuizQuestions();
    await exportMissionQuizLinks();

    console.log("\n✨ Export completed!");
    console.log(
      "\nYAML files have been created in the mission_data directory.",
    );
  } catch (error) {
    console.error("\n❌ Export failed:", error);
    process.exit(1);
  }
}

main();
