import type { SupabaseClient } from "@supabase/supabase-js";
import { grantXp } from "@/features/user-level/services/level";
import { MAX_POSTER_COUNT } from "@/lib/constants/mission-config";
import { ARTIFACT_TYPES } from "@/lib/types/artifact-types";
import type { Database } from "@/lib/types/supabase";
import type { AchieveMissionFormData } from "./actions";

// buildArtifactPayload の戻り値型
type ArtifactFields = {
  link_url: string | null;
  text_content: string | null;
  image_storage_path: string | null;
};

function nullFields(): ArtifactFields {
  return { link_url: null, text_content: null, image_storage_path: null };
}

/**
 * artifact type ごとのペイロードフィールドビルダー
 */
const ARTIFACT_PAYLOAD_BUILDERS: Record<
  string,
  (data: AchieveMissionFormData) => ArtifactFields
> = {
  [ARTIFACT_TYPES.LINK.key]: (data) => {
    if (data.requiredArtifactType !== ARTIFACT_TYPES.LINK.key)
      return nullFields();
    return {
      link_url: data.artifactLink,
      text_content: null,
      image_storage_path: null,
    };
  },
  [ARTIFACT_TYPES.TEXT.key]: (data) => {
    if (data.requiredArtifactType !== ARTIFACT_TYPES.TEXT.key)
      return nullFields();
    return {
      link_url: null,
      text_content: data.artifactText,
      image_storage_path: null,
    };
  },
  [ARTIFACT_TYPES.EMAIL.key]: (data) => {
    if (data.requiredArtifactType !== ARTIFACT_TYPES.EMAIL.key)
      return nullFields();
    return {
      link_url: null,
      text_content: data.artifactEmail,
      image_storage_path: null,
    };
  },
  [ARTIFACT_TYPES.IMAGE.key]: (data) => {
    if (data.requiredArtifactType !== ARTIFACT_TYPES.IMAGE.key)
      return nullFields();
    return {
      link_url: null,
      text_content: null,
      image_storage_path: data.artifactImagePath,
    };
  },
  [ARTIFACT_TYPES.IMAGE_WITH_GEOLOCATION.key]: (data) => {
    if (data.requiredArtifactType !== ARTIFACT_TYPES.IMAGE_WITH_GEOLOCATION.key)
      return nullFields();
    return {
      link_url: null,
      text_content: null,
      image_storage_path: data.artifactImagePath,
    };
  },
  [ARTIFACT_TYPES.POSTING.key]: (data) => {
    if (data.requiredArtifactType !== ARTIFACT_TYPES.POSTING.key)
      return nullFields();
    return {
      link_url: null,
      text_content: `${data.postingCount}枚を${data.locationText}に配布`,
      image_storage_path: null,
    };
  },
  [ARTIFACT_TYPES.POSTER.key]: (data) => {
    if (data.requiredArtifactType !== ARTIFACT_TYPES.POSTER.key)
      return nullFields();
    const locationInfo = `${data.prefecture}${data.city} ${data.boardNumber}`;
    const nameInfo = data.boardName ? ` (${data.boardName})` : "";
    const statusInfo = data.boardNote ? ` - 状況: ${data.boardNote}` : "";
    return {
      link_url: null,
      text_content: `${locationInfo}${nameInfo}に貼付${statusInfo}`,
      image_storage_path: null,
    };
  },
  [ARTIFACT_TYPES.QUIZ.key]: () => nullFields(),
  [ARTIFACT_TYPES.YOUTUBE.key]: (data) => {
    if (data.requiredArtifactType !== ARTIFACT_TYPES.YOUTUBE.key)
      return nullFields();
    return {
      link_url: data.artifactLink,
      text_content: null,
      image_storage_path: null,
    };
  },
  [ARTIFACT_TYPES.YOUTUBE_COMMENT.key]: (data) => {
    if (data.requiredArtifactType !== ARTIFACT_TYPES.YOUTUBE_COMMENT.key)
      return nullFields();
    return {
      link_url: data.artifactLink,
      text_content: null,
      image_storage_path: null,
    };
  },
};

/**
 * artifact type に基づいてペイロードフィールドをビルドする。
 * 10分岐の if-else チェーンを置き換える。
 */
export function buildArtifactPayload(
  artifactType: string,
  validatedData: AchieveMissionFormData,
): ArtifactFields {
  const builder = ARTIFACT_PAYLOAD_BUILDERS[artifactType];
  if (!builder) {
    return nullFields();
  }
  return builder(validatedData);
}

/**
 * artifact type のラベルを取得する（ログ用）。
 */
export function getArtifactTypeLabel(artifactType: string): string {
  for (const type of Object.values(ARTIFACT_TYPES)) {
    if (type.key === artifactType) {
      return type.key;
    }
  }
  return "OTHER";
}

/**
 * POSTING / POSTER 共通のボーナスXP計算・付与。
 * 失敗時は 0 を返す（ボーナス失敗はミッション達成の成功を妨げない）。
 */
export async function grantActivityBonusXp(params: {
  userId: string;
  achievementId: string;
  count: number;
  pointsPerUnit: number;
  isFeatured: boolean;
  descriptionLabel: string;
}): Promise<number> {
  const {
    userId,
    achievementId,
    count,
    pointsPerUnit,
    isFeatured,
    descriptionLabel,
  } = params;

  const basePoints = count * pointsPerUnit;
  const totalPoints = isFeatured ? basePoints * 2 : basePoints;

  const bonusXpResult = await grantXp(
    userId,
    totalPoints,
    "BONUS",
    achievementId,
    `${descriptionLabel}（${count}枚=${totalPoints}ポイント${isFeatured ? "【2倍】" : ""}）`,
  );

  if (!bonusXpResult.success) {
    console.error(
      `${descriptionLabel}XP付与に失敗しました:`,
      bonusXpResult.error,
    );
    return 0;
  }

  return totalPoints;
}

/**
 * posting_activities テーブルにレコードを挿入する。
 */
export async function savePostingActivity(
  supabase: SupabaseClient<Database>,
  params: {
    artifactId: string;
    postingCount: number;
    locationText: string;
    shapeId: string | null;
  },
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from("posting_activities").insert({
    mission_artifact_id: params.artifactId,
    posting_count: params.postingCount,
    location_text: params.locationText,
    shape_id: params.shapeId,
  });

  if (error) {
    console.error("Posting activity save error:", error);
    return {
      success: false,
      error: `ポスティング活動の保存に失敗しました: ${error.message}`,
    };
  }
  return { success: true };
}

/**
 * poster_activities テーブルにレコードを挿入する。
 */
export async function savePosterActivity(
  supabase: SupabaseClient<Database>,
  params: {
    userId: string;
    artifactId: string;
    prefecture: Database["public"]["Enums"]["poster_prefecture_enum"];
    city: string;
    boardNumber: string;
    boardName: string | null;
    boardNote: string | null;
    boardAddress: string | null;
    boardLat: number | null;
    boardLong: number | null;
    boardId: string | null;
  },
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from("poster_activities").insert({
    user_id: params.userId,
    mission_artifact_id: params.artifactId,
    poster_count: MAX_POSTER_COUNT,
    prefecture: params.prefecture,
    city: params.city,
    number: params.boardNumber,
    name: params.boardName,
    note: params.boardNote,
    address: params.boardAddress,
    lat: params.boardLat,
    long: params.boardLong,
    board_id: params.boardId,
  });

  if (error) {
    console.error("Poster activity save error:", error);
    return {
      success: false,
      error: `ポスター活動の保存に失敗しました: ${error.message}`,
    };
  }
  return { success: true };
}
