import type { CategoryWithMissions } from "@/features/missions/utils/group-missions-by-category";
import type { Tables } from "@/lib/types/supabase";
import type { User } from "@supabase/supabase-js";

export type MissionArtifact = Tables<"mission_artifacts"> & {
  geolocations?: Tables<"mission_artifact_geolocations">[];
};

export type Achievement = {
  created_at: string;
  id: string;
  mission_id: string | null;
  user_id: string | null;
};

export type SubmissionData = {
  id: string; // achievement_id
  mission_id: string;
  user_id: string;
  season_id: string;
  artifacts: MissionArtifact[];
  created_at: string;
};

export type MissionPageData = {
  mission: Tables<"missions">;
  userAchievements: Achievement[];
  submissions: SubmissionData[];
  userAchievementCount: number;
  userAchievementCountMap: Map<string, number>;
  totalAchievementCount: number;
  referralCode: string | null;
  mainLink: Tables<"mission_main_links"> | null;
  allCategoryMissions: CategoryWithMissions[];
};

export type ButtonLabelProps = {
  authUser: User | null;
  achievement: Achievement | null;
  userAchievementCount: number;
  maxAchievementCount: number | null;
};
