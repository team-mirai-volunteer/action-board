"use server";

import { achieveMissionAction } from "@/features/mission-detail/actions/actions";
import { createClient } from "@/lib/supabase/client";
import type { PostingShapeStatus } from "../config/status-config";
import type { MapShape } from "../types/posting-types";

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
  const supabase = createClient();

  // posting-magazineミッションのIDを取得
  const { data: mission } = await supabase
    .from("missions")
    .select("id")
    .eq("slug", "posting-magazine")
    .single();

  if (!mission) {
    return { success: false, error: "ミッションが見つかりません" };
  }

  // achieveMissionActionを呼び出してミッション達成を記録
  const formData = new FormData();
  formData.append("missionId", mission.id);
  formData.append("requiredArtifactType", "POSTING");
  formData.append("postingCount", postingCount.toString());
  formData.append("locationText", locationText);
  // shape_idはachieveMissionAction内で処理される必要がある
  // 現在の実装ではshape_idは直接サポートされていないので、
  // ここで追加のposting_activities更新が必要

  const result = await achieveMissionAction(formData);

  if (result.success && shape.id) {
    // posting_activitiesにshape_idを追加する
    // achieveMissionActionで作成されたposting_activityを取得して更新
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // 最新のposting_activityを取得してshape_idを更新
      const { data: latestActivity } = await supabase
        .from("posting_activities")
        .select(`
          id,
          mission_artifacts!inner(
            achievements!inner(
              user_id
            )
          )
        `)
        .eq("mission_artifacts.achievements.user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (latestActivity) {
        // NOTE: shape_id column is added by migration 20260111000002
        await supabase
          .from("posting_activities")
          .update({ shape_id: shape.id } as Record<string, unknown>)
          .eq("id", latestActivity.id);
      }
    }
  }

  return result;
}

// ステータス履歴のクエリ結果の型
interface StatusHistoryQueryResult {
  id: string;
  shape_id: string;
  user_id: string;
  previous_status: string | null;
  new_status: string;
  note: string | null;
  created_at: string;
  public_user_profiles: { name: string | null } | null;
}

/**
 * シェイプのステータス履歴を取得（Server Action版）
 * NOTE: posting_shape_status_history table is created by migration 20260111000002
 */
export async function getShapeStatusHistoryAction(shapeId: string) {
  const supabase = createClient();

  // Use type assertion since the table is created by migration
  const { data, error } = await supabase
    .from("posting_shape_status_history" as "posting_activities")
    .select("*")
    .eq("shape_id" as "id", shapeId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading status history:", error);
    return [];
  }

  return (data || []).map((item) => ({
    id: (item as Record<string, unknown>).id as string,
    shape_id: (item as Record<string, unknown>).shape_id as string,
    user_id: (item as Record<string, unknown>).user_id as string,
    previous_status: (item as Record<string, unknown>).previous_status as
      | string
      | null,
    new_status: (item as Record<string, unknown>).new_status as string,
    note: (item as Record<string, unknown>).note as string | null,
    created_at: (item as Record<string, unknown>).created_at as string,
    user: null, // User info will be loaded separately if needed
  }));
}

/**
 * シェイプに対するユーザーのミッション達成状況をチェック（Server Action版）
 * NOTE: shape_id column on posting_activities is added by migration 20260111000002
 */
export async function checkShapeMissionCompletedAction(
  shapeId: string,
  userId: string,
): Promise<boolean> {
  const supabase = createClient();

  // posting-magazineミッションのIDを取得
  const { data: mission } = await supabase
    .from("missions")
    .select("id")
    .eq("slug", "posting-magazine")
    .single();

  if (!mission) return false;

  // このシェイプで既にミッション達成しているかチェック
  // NOTE: shape_id column is added by migration, so we use type assertion
  const { data: activities } = await supabase
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
    .eq("shape_id" as "id", shapeId)
    .eq("mission_artifacts.achievements.user_id", userId)
    .eq("mission_artifacts.achievements.mission_id", mission.id);

  return !!(activities && activities.length > 0);
}

/**
 * イベント内のシェイプのステータス別統計を取得
 * NOTE: status column on posting_shapes is added by migration 20260111000002
 */
export async function getShapeStatsAction(eventId: string): Promise<{
  totalCount: number;
  statusCounts: Record<PostingShapeStatus, number>;
}> {
  const supabase = createClient();

  // NOTE: status column is added by migration
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
    const status =
      ((shape as Record<string, unknown>).status as PostingShapeStatus) ||
      "planned";
    statusCounts[status]++;
  }

  return {
    totalCount: data?.length || 0,
    statusCounts,
  };
}
