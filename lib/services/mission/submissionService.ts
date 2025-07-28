import "server-only";

import { ARTIFACT_TYPES } from "@/lib/artifactTypes";
import { createServiceClient } from "@/lib/supabase/server";
import type { Achievement } from "@/lib/types/domain";
import type { TablesInsert } from "@/lib/types/supabase";

export interface CreateAchievementResult {
  success: boolean;
  achievement?: Achievement;
  error?: string;
}

export async function createMissionAchievement(
  userId: string,
  missionId: string,
): Promise<CreateAchievementResult> {
  const supabase = await createServiceClient();

  const achievementPayload = {
    user_id: userId,
    mission_id: missionId,
  };

  const { data: achievement, error: achievementError } = await supabase
    .from("achievements")
    .insert(achievementPayload)
    .select("id, created_at, mission_id, user_id")
    .single();

  if (achievementError) {
    console.error(
      `Achievement Error: ${achievementError.code} ${achievementError.message}`,
    );
    return {
      success: false,
      error: `ミッション達成の記録に失敗しました: ${achievementError.message}`,
    };
  }

  if (!achievement) {
    return {
      success: false,
      error: "達成記録の作成に失敗しました。",
    };
  }

  return {
    success: true,
    achievement: achievement as Achievement,
  };
}

export async function createMissionArtifact(
  achievementId: string,
  userId: string,
  artifactType: string,
  artifactData: Record<string, string | undefined>,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServiceClient();

  const artifactPayload: TablesInsert<"mission_artifacts"> = {
    achievement_id: achievementId,
    user_id: userId,
    artifact_type: artifactType,
    description: artifactData.description || null,
    link_url: null,
    text_content: null,
    image_storage_path: null,
  };

  switch (artifactType) {
    case ARTIFACT_TYPES.LINK.key:
      artifactPayload.link_url = artifactData.link;
      break;
    case ARTIFACT_TYPES.TEXT.key:
    case ARTIFACT_TYPES.EMAIL.key:
      artifactPayload.text_content = artifactData.text || artifactData.email;
      break;
    case ARTIFACT_TYPES.IMAGE.key:
    case ARTIFACT_TYPES.IMAGE_WITH_GEOLOCATION.key:
      artifactPayload.image_storage_path = artifactData.imagePath;
      break;
  }

  const { error: artifactError } = await supabase
    .from("mission_artifacts")
    .insert(artifactPayload);

  if (artifactError) {
    console.error(`Artifact Error: ${artifactError.message}`);
    return {
      success: false,
      error: `成果物の保存に失敗しました: ${artifactError.message}`,
    };
  }

  return { success: true };
}
