export interface Category {
  slug: string;
  title: string | null;
  sort_no: number;
  category_kbn: string;
}

export interface Mission {
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
}

export interface CategoryLink {
  category_slug: string;
  missions: {
    mission_slug: string;
    sort_no: number;
  }[];
}

export interface QuizCategory {
  slug: string;
  name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
}

export interface QuizQuestion {
  id: string;
  category_slug: string;
  mission_slug?: string | null;
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct_answer: number;
  explanation: string | null;
  question_order?: number | null;
  is_active: boolean;
}

export interface MissionQuizLink {
  mission_slug: string;
  link: string;
  remark: string | null;
  display_order: number;
}

export interface MissionMainLink {
  mission_slug: string;
  label: string;
  link: string;
  auto_complete?: boolean;
}

export interface MissionData {
  categories: Category[];
  missions: Mission[];
  category_links: CategoryLink[];
  quiz_categories: QuizCategory[];
  quiz_questions: QuizQuestion[];
  mission_quiz_links: MissionQuizLink[];
  mission_main_links?: MissionMainLink[];
}
