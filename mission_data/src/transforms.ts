import type {
  Category,
  CategoryLink,
  Mission,
  MissionMainLink,
  MissionQuizLink,
  QuizCategory,
  QuizQuestion,
} from "./types";

/**
 * DB row from mission_category table -> Category YAML format
 */
export function transformCategoriesToYaml(
  data: Array<{
    slug: string;
    category_title: string | null;
    sort_no: number;
    category_kbn: string;
  }>,
): Category[] {
  return data.map((item) => ({
    slug: item.slug,
    title: item.category_title,
    sort_no: item.sort_no,
    category_kbn: item.category_kbn,
  }));
}

/**
 * DB row from missions table -> Mission YAML format
 */
export function transformMissionsToYaml(
  data: Array<{
    slug: string;
    title: string;
    icon_url: string | null;
    content: string | null;
    difficulty: number;
    required_artifact_type: string;
    max_achievement_count: number | null;
    is_featured: boolean;
    is_hidden: boolean;
    artifact_label?: string | null;
    ogp_image_url?: string | null;
    event_date?: string | null;
  }>,
): Mission[] {
  return data.map((item) => ({
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
}

/**
 * DB row from mission_category_link (with joins) -> grouped CategoryLink[] YAML format
 */
export function groupLinksByCategory(
  data: Array<{
    mission_id: string;
    category_id: string;
    sort_no: number;
    missions: { slug: string };
    mission_category: { slug: string };
  }>,
): CategoryLink[] {
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

  return Object.entries(linksByCategory).map(([category_slug, missions]) => ({
    category_slug,
    missions,
  }));
}

/**
 * DB row from quiz_categories table -> QuizCategory YAML format
 */
export function transformQuizCategoriesToYaml(
  data: Array<{
    slug: string;
    name: string;
    description: string | null;
    display_order: number;
    is_active: boolean;
  }>,
): QuizCategory[] {
  return data.map((item) => ({
    slug: item.slug,
    name: item.name,
    description: item.description,
    display_order: item.display_order,
    is_active: item.is_active,
  }));
}

/**
 * DB row from quiz_questions (with joins) -> QuizQuestion YAML format
 */
export function transformQuizQuestionsToYaml(
  data: Array<{
    id: string;
    quiz_categories: { slug: string };
    missions: { slug: string } | null;
    question: string;
    option1: string;
    option2: string;
    option3: string;
    option4: string;
    correct_answer: number;
    explanation: string | null;
    question_order: number | null;
    is_active: boolean;
  }>,
): QuizQuestion[] {
  return data.map((item) => ({
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
}

/**
 * DB row from mission_quiz_links (with join) -> MissionQuizLink YAML format
 */
export function transformMissionQuizLinksToYaml(
  data: Array<{
    missions: { slug: string };
    link: string;
    remark: string | null;
    display_order: number;
  }>,
): MissionQuizLink[] {
  return data.map((item) => ({
    mission_slug: item.missions.slug,
    link: item.link,
    remark: item.remark,
    display_order: item.display_order,
  }));
}

/**
 * DB row from mission_main_links (with join) -> MissionMainLink YAML format
 */
export function transformMissionMainLinksToYaml(
  data: Array<{
    missions: { slug: string };
    label: string;
    link: string;
  }>,
): MissionMainLink[] {
  return data.map((item) => ({
    mission_slug: item.missions.slug,
    label: item.label,
    link: item.link,
  }));
}
