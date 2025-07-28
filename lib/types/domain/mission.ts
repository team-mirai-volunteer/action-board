import type { Tables } from "../supabase";

export interface MissionYaml {
  slug: string;
  title: string;
  icon_url: string | null;
  content: string | null;
  difficulty: number;
  required_artifact_type: string;
  max_achievement_count: number | null;
  is_featured: boolean;
  featured_importance?: number | null;
  is_hidden: boolean;
  artifact_label?: string | null;
  ogp_image_url?: string | null;
  event_date?: string | null;
}

export type Mission = Tables<"missions">;

export type MissionArtifact = Tables<"mission_artifacts"> & {
  geolocations?: Tables<"mission_artifact_geolocations">[];
};

export interface Achievement {
  created_at: string;
  id: string;
  mission_id: string | null;
  user_id: string | null;
}

export interface SubmissionData {
  id: string;
  mission_id: string;
  user_id: string;
  artifacts: MissionArtifact[];
  created_at: string;
}

export interface MissionPageData {
  mission: Mission;
  userAchievements: Achievement[];
  submissions: SubmissionData[];
  userAchievementCount: number;
  totalAchievementCount: number;
  referralCode: string | null;
  mainLink: Tables<"mission_main_links"> | null;
}
