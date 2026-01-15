import { createClient } from "@/lib/supabase/client";
import type { PostingShapeStatus } from "../config/status-config";
import type { MapShape, ShapeMissionStatus } from "../types/posting-types";

const supabase = createClient();

export async function saveShape(shape: MapShape) {
  const nowISO = new Date().toISOString();

  const shapeWithMeta = {
    ...shape,
    created_at: shape.created_at ?? nowISO,
    updated_at: shape.updated_at ?? nowISO,
  };

  const { data, error } = await supabase
    .from("posting_shapes")
    .insert([shapeWithMeta as never])
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

  if (!data || data.length === 0) {
    return [];
  }

  // Get unique user IDs
  const userIds = Array.from(
    new Set(data.map((s) => s.user_id).filter((id): id is string => !!id)),
  );

  // Fetch display names for all users
  let userDisplayNames: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("public_user_profiles")
      .select("id, name")
      .in("id", userIds);

    if (profiles) {
      userDisplayNames = profiles.reduce(
        (acc, p) => {
          if (p.id && p.name) {
            acc[p.id] = p.name;
          }
          return acc;
        },
        {} as Record<string, string>,
      );
    }
  }

  // Merge display names into shapes
  return data.map((shape) => ({
    ...shape,
    user_display_name: shape.user_id
      ? userDisplayNames[shape.user_id]
      : undefined,
  }));
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

export async function updateShapeStatus(
  id: string,
  status: PostingShapeStatus,
  memo?: string | null,
) {
  const { data, error } = await supabase
    .from("posting_shapes")
    .update({
      status,
      memo,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating shape status:", error);
    throw error;
  }

  return data;
}

// 図形に紐づくミッション達成状況を取得
export async function getShapeMissionStatus(
  shapeId: string,
): Promise<ShapeMissionStatus> {
  const { data, error } = await supabase
    .from("posting_activities")
    .select("id, posting_count, mission_artifact_id")
    .eq("shape_id", shapeId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching shape mission status:", error);
    throw error;
  }

  return {
    isCompleted: !!data,
    postingCount: data?.posting_count,
    missionArtifactId: data?.mission_artifact_id,
  };
}
