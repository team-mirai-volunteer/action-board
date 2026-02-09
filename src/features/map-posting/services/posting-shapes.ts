import "server-only";

import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/adminClient";
import { isAdmin, isPostingAdmin } from "@/lib/utils/admin";
import { chunk } from "@/lib/utils/array-utils";
import type { PostingShapeStatus } from "../config/status-config";
import type { MapShape, ShapeMissionStatus } from "../types/posting-types";
import {
  calculatePolygonArea,
  calculatePolygonCentroid,
} from "../utils/polygon-utils";
import { reverseGeocode } from "./reverse-geocoding";

/**
 * 図形の座標から住所情報と中心座標を取得
 * ポリゴンの場合は中心座標を使用
 */
async function getAddressForShape(shape: MapShape): Promise<{
  prefecture: string | null;
  city: string | null;
  address: string | null;
  postcode: string | null;
  lat: number | null;
  lng: number | null;
}> {
  // テキストタイプは住所取得不要
  if (shape.type === "text") {
    return {
      prefecture: null,
      city: null,
      address: null,
      postcode: null,
      lat: null,
      lng: null,
    };
  }

  const centroid = calculatePolygonCentroid(shape.coordinates);

  if (!centroid) {
    console.warn("Could not calculate centroid for shape");
    return {
      prefecture: null,
      city: null,
      address: null,
      postcode: null,
      lat: null,
      lng: null,
    };
  }

  const geocodeResult = await reverseGeocode(centroid.lat, centroid.lng);

  return {
    ...geocodeResult,
    lat: centroid.lat,
    lng: centroid.lng,
  };
}

export async function saveShape(shape: MapShape) {
  const supabase = await createAdminClient();
  const nowISO = new Date().toISOString();

  // ポリゴンの場合、住所情報を取得
  const addressInfo = await getAddressForShape(shape);

  // ポリゴンの場合、面積を計算
  const areaM2 =
    shape.type === "polygon" ? calculatePolygonArea(shape.coordinates) : null;

  const shapeWithMeta = {
    ...shape,
    ...addressInfo, // prefecture, city, address, postcode, lat, lng を追加
    area_m2: areaM2,
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

/**
 * 図形の所有者または管理者であることを確認する認可チェック
 */
export async function authorizeShapeOwnerOrAdmin(
  id: string,
  user: User,
): Promise<void> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("posting_shapes")
    .select("user_id")
    .eq("id", id)
    .single();

  if (error || !data) {
    throw new Error("図形が見つかりません");
  }
  if (data.user_id !== user.id && !isAdmin(user) && !isPostingAdmin(user)) {
    throw new Error("この図形を操作する権限がありません");
  }
}

export async function deleteShape(id: string) {
  const supabase = await createAdminClient();
  const { count, error } = await supabase
    .from("posting_shapes")
    .delete({ count: "exact" })
    .eq("id", id);

  if (count == null || count === 0) {
    throw new Error("No shape deleted");
  }

  if (error) {
    console.error("Error deleting shape:", error);
    throw error;
  }
}

// URLパラメータ長制限を回避するためのバッチサイズ
const BATCH_SIZE = 200;

export async function loadShapes(eventId: string) {
  const supabase = await createAdminClient();
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

  // Fetch display names for all users (in batches to avoid URL length limit)
  const userDisplayNames: Record<string, string> = {};
  if (userIds.length > 0) {
    const userIdBatches = chunk(userIds, BATCH_SIZE);
    const profileResults = await Promise.all(
      userIdBatches.map((batch) =>
        supabase
          .from("public_user_profiles")
          .select("id, name")
          .in("id", batch),
      ),
    );

    for (const result of profileResults) {
      if (result.data) {
        for (const p of result.data) {
          if (p.id && p.name) {
            userDisplayNames[p.id] = p.name;
          }
        }
      }
    }
  }

  // Fetch posting_count for all shapes from posting_activities (in batches to avoid URL length limit)
  const shapeIds = data.map((s) => s.id).filter((id): id is string => !!id);
  const postingCounts: Record<string, number> = {};
  if (shapeIds.length > 0) {
    const shapeIdBatches = chunk(shapeIds, BATCH_SIZE);
    const activityResults = await Promise.all(
      shapeIdBatches.map((batch) =>
        supabase
          .from("posting_activities")
          .select("shape_id, posting_count")
          .in("shape_id", batch),
      ),
    );

    for (const result of activityResults) {
      if (result.data) {
        for (const a of result.data) {
          if (a.shape_id && a.posting_count) {
            postingCounts[a.shape_id] = a.posting_count;
          }
        }
      }
    }
  }

  // Merge display names and posting counts into shapes
  return data.map((shape) => ({
    ...shape,
    user_display_name: shape.user_id
      ? userDisplayNames[shape.user_id]
      : undefined,
    posting_count: shape.id ? postingCounts[shape.id] : undefined,
  }));
}

export async function updateShape(id: string, data: Partial<MapShape>) {
  const supabase = await createAdminClient();
  // Exclude protected fields that should not be updated
  const {
    id: _id,
    created_at,
    updated_at: _updated_at,
    ...allowedFields
  } = data;

  // coordinates が更新される場合は住所と中心座標、面積も再取得
  let addressInfo: {
    prefecture?: string | null;
    city?: string | null;
    address?: string | null;
    postcode?: string | null;
    lat?: number | null;
    lng?: number | null;
    area_m2?: number | null;
  } = {};
  if (allowedFields.coordinates && allowedFields.type !== "text") {
    const centroid = calculatePolygonCentroid(allowedFields.coordinates);
    if (centroid) {
      const geocodeResult = await reverseGeocode(centroid.lat, centroid.lng);
      addressInfo = {
        ...geocodeResult,
        lat: centroid.lat,
        lng: centroid.lng,
        area_m2: calculatePolygonArea(allowedFields.coordinates),
      };
    }
  }

  const updateData = {
    ...allowedFields,
    ...addressInfo,
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
  const supabase = await createAdminClient();
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
  const supabase = await createAdminClient();
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
