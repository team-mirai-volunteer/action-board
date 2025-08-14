import type { Tables } from "@/lib/types/supabase";

export type MissionArtifact = Tables<"mission_artifacts"> & {
  geolocations?: Tables<"mission_artifact_geolocations">[];
};

export interface Submission
  extends Omit<Tables<"achievements">, "id" | "mission_id" | "user_id"> {
  id: string; // achievement_id
  mission_id: string;
  user_id: string;
  artifacts: MissionArtifact[];
  created_at: string;
}
