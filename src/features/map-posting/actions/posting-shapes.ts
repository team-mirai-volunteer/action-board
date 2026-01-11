"use server";

import { achieveMissionAction } from "@/features/mission-detail/actions/actions";
import { createClient } from "@/lib/supabase/client";
import { z } from "zod";
import type { PostingShapeStatus } from "../config/status-config";
import type { MapShape } from "../types/posting-types";

// completePostingMissionAction用のバリデーションスキーマ
const completePostingMissionSchema = z.object({
  postingCount: z.number().min(1).max(1000),
  locationText: z.string().min(1).max(500),
});

/**
 * ポスティングマップからミッションを達成する
 * @param shape シェイプ情報
 * @param postingCount 配布枚数
 * @param locationText 配布場所のテキスト
 */
export async function completePostingMissionAction(
  shape: MapShape,
  postingCount: number,
  locationText: string,
): Promise<{ success: boolean; xpGranted?: number; error?: string }> {
  // 入力バリデーション
  const validationResult = completePostingMissionSchema.safeParse({
    postingCount,
    locationText,
  });

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.errors.map((e) => e.message).join(", "),
    };
  }

  const supabase = createClient();

  // posting-magazineミッションのIDを取得
  const { data: mission, error: missionError } = await supabase
    .from("missions")
    .select("id")
    .eq("slug", "posting-magazine")
    .single();

  if (missionError) {
    console.error("Mission fetch error:", missionError);
    return { success: false, error: "ミッション情報の取得に失敗しました" };
  }

  if (!mission) {
    return { success: false, error: "ミッションが見つかりません" };
  }

  // achieveMissionActionを呼び出してミッション達成を記録
  // shape_idはFormDataで渡し、achieveMissionActionで直接posting_activitiesに保存される
  const formData = new FormData();
  formData.append("missionId", mission.id);
  formData.append("requiredArtifactType", "POSTING");
  formData.append("postingCount", postingCount.toString());
  formData.append("locationText", locationText);
  if (shape.id) {
    formData.append("shapeId", shape.id);
  }

  const result = await achieveMissionAction(formData);

  return result;
}

/**
 * シェイプのステータス履歴を取得（Server Action版）
 */
export async function getShapeStatusHistoryAction(shapeId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("posting_shape_status_history")
    .select("*")
    .eq("shape_id", shapeId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading status history:", error);
    return [];
  }

  return (data || []).map((item) => ({
    id: item.id,
    shape_id: item.shape_id,
    user_id: item.user_id,
    previous_status: item.previous_status,
    new_status: item.new_status,
    note: item.note,
    created_at: item.created_at,
    user: undefined,
  }));
}

/**
 * シェイプに対するユーザーのミッション達成状況をチェック（Server Action版）
 */
export async function checkShapeMissionCompletedAction(
  shapeId: string,
  userId: string,
): Promise<boolean> {
  const supabase = createClient();

  // posting-magazineミッションのIDを取得
  const { data: mission, error: missionError } = await supabase
    .from("missions")
    .select("id")
    .eq("slug", "posting-magazine")
    .single();

  if (missionError) {
    console.error("Mission fetch error:", missionError);
    return false;
  }

  if (!mission) return false;

  // このシェイプで既にミッション達成しているかチェック
  const { data: activities, error: activitiesError } = await supabase
    .from("posting_activities")
    .select(`
      id,
      mission_artifacts!inner(
        achievements!inner(
          mission_id,
          user_id
        )
      )
    `)
    .eq("shape_id", shapeId)
    .eq("mission_artifacts.achievements.user_id", userId)
    .eq("mission_artifacts.achievements.mission_id", mission.id);

  if (activitiesError) {
    console.error("Activities fetch error:", activitiesError);
    return false;
  }

  return !!(activities && activities.length > 0);
}

/**
 * イベント内のシェイプのステータス別統計を取得
 */
export async function getShapeStatsAction(eventId: string): Promise<{
  totalCount: number;
  statusCounts: Record<PostingShapeStatus, number>;
}> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("posting_shapes")
    .select("*")
    .eq("event_id", eventId)
    .eq("type", "polygon"); // ポリゴンのみカウント

  if (error) {
    console.error("Error fetching shape stats:", error);
    return {
      totalCount: 0,
      statusCounts: {
        planned: 0,
        completed: 0,
        unavailable: 0,
        other: 0,
      },
    };
  }

  const statusCounts: Record<PostingShapeStatus, number> = {
    planned: 0,
    completed: 0,
    unavailable: 0,
    other: 0,
  };

  for (const shape of data || []) {
    const status = shape.status || "planned";
    statusCounts[status]++;
  }

  return {
    totalCount: data?.length || 0,
    statusCounts,
  };
}
