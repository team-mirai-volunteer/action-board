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

export interface MissionData {
  categories: Category[];
  missions: Mission[];
  category_links: CategoryLink[];
}
