import { createClient } from "@/lib/supabase/client";
import type { PostingShapeStatus } from "../config/status-config";
import type { MapShape } from "../types/posting-types";

const supabase = createClient();

// ステータス履歴の型
export interface StatusHistory {
  id: string;
  shape_id: string;
  user_id: string;
  previous_status: PostingShapeStatus | null;
  new_status: PostingShapeStatus;
  note: string | null;
  created_at: string;
  user?: {
    name: string | null;
  };
}

export async function saveShape(shape: MapShape) {
  const nowISO = new Date().toISOString();

  const shapeWithMeta = {
    ...shape,
    created_at: shape.created_at ?? nowISO,
    updated_at: shape.updated_at ?? nowISO,
  };

  const { data, error } = await supabase
    .from("posting_shapes")
    .insert([shapeWithMeta])
    .select()
    .single();

  if (error) {
    console.error("Error saving shape:", error);
    throw error;
  }

  return data;
}

export async function deleteShape(id: string) {
  const { error } = await supabase.from("posting_shapes").delete().eq("id", id);

  if (error) {
    console.error("Error deleting shape:", error);
    throw error;
  }
}

export async function loadShapes(eventId: string) {
  const { data, error } = await supabase
    .from("posting_shapes")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading shapes:", error);
    throw error;
  }

  return data || [];
}

export async function updateShape(id: string, data: Partial<MapShape>) {
  // Exclude protected fields that should not be updated
  const {
    id: _id,
    created_at,
    updated_at: _updated_at,
    ...allowedFields
  } = data;

  const updateData = {
    ...allowedFields,
    updated_at: new Date().toISOString(),
  };

  const { data: rows, error } = await supabase
    .from("posting_shapes")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating shape:", error);
    throw error;
  }

  return rows;
}

/**
 * シェイプのステータスを更新する
 */
export async function updateShapeStatus(
  shapeId: string,
  newStatus: PostingShapeStatus,
  note?: string,
) {
  const supabase = createClient();

  // 現在のシェイプステータスを取得
  const { data: currentShape, error: fetchError } = await supabase
    .from("posting_shapes")
    .select("*")
    .eq("id", shapeId)
    .single();

  if (fetchError) {
    console.error("Error fetching current shape status:", fetchError);
    throw fetchError;
  }

  // 現在のユーザーを取得
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be authenticated to update shape status");
  }

  // シェイプのステータスとuser_idを更新
  const { error: updateError } = await supabase
    .from("posting_shapes")
    .update({
      status: newStatus,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", shapeId);

  if (updateError) {
    console.error("Error updating shape status:", updateError);
    throw updateError;
  }

  // ステータス履歴を追加
  const { error: historyError } = await supabase
    .from("posting_shape_status_history")
    .insert([
      {
        shape_id: shapeId,
        user_id: user.id,
        previous_status: currentShape.status,
        new_status: newStatus,
        note: note || null,
      },
    ]);

  if (historyError) {
    console.error("Error inserting status history:", historyError);
    throw historyError;
  }

  return { success: true };
}

/**
 * シェイプのステータス履歴を取得する
 */
export async function getShapeStatusHistory(
  shapeId: string,
): Promise<StatusHistory[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("posting_shape_status_history")
    .select("*")
    .eq("shape_id", shapeId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading status history:", error);
    throw error;
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
 * シェイプに対してユーザーがミッションを達成済みかどうかをチェック
 */
export async function checkShapeMissionCompleted(
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
    .eq("shape_id", shapeId)
    .eq("mission_artifacts.achievements.user_id", userId)
    .eq("mission_artifacts.achievements.mission_id", mission.id);

  return !!(activities && activities.length > 0);
}

/**
 * シェイプの詳細情報を取得する
 */
export async function getShapeDetail(
  shapeId: string,
): Promise<MapShape | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("posting_shapes")
    .select("*")
    .eq("id", shapeId)
    .single();

  if (error) {
    console.error("Error fetching shape detail:", error);
    return null;
  }

  return data as MapShape;
}
