import { achieveMissionAction } from "@/features/mission-detail/actions/actions";
import { createClient } from "@/lib/supabase/client";
import { getShapeMissionStatus } from "./posting-shapes";

// ミッション達成済みかチェック（posting_activitiesのshape_idで判定）
export async function checkShapeMissionCompleted(
  shapeId: string,
): Promise<boolean> {
  const status = await getShapeMissionStatus(shapeId);
  return status.isCompleted;
}

// ミッション達成処理
export async function completePostingMission(
  shapeId: string,
  postingCount: number,
  locationText?: string,
): Promise<{ success: boolean; xpGranted?: number; error?: string }> {
  const supabase = createClient();

  // 既に達成済みかチェック
  const isCompleted = await checkShapeMissionCompleted(shapeId);
  if (isCompleted) {
    return { success: false, error: "この図形は既にミッション達成済みです" };
  }

  // posting-magazine ミッションを取得
  const { data: mission } = await supabase
    .from("missions")
    .select("id")
    .eq("slug", "posting-magazine")
    .single();

  if (!mission) {
    return { success: false, error: "ミッションが見つかりません" };
  }

  // FormData を構築
  const formData = new FormData();
  formData.append("missionId", mission.id);
  formData.append("requiredArtifactType", "POSTING");
  formData.append("postingCount", postingCount.toString());
  formData.append("locationText", locationText || "ポスティングマップから配布");
  formData.append("shapeId", shapeId); // shape_id を渡す（posting_activitiesに保存）

  const result = await achieveMissionAction(formData);

  return {
    success: result.success,
    xpGranted: result.xpGranted,
    error: result.success ? undefined : result.error,
  };
}
