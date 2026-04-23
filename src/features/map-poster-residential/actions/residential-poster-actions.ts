"use server";

import type { User } from "@supabase/supabase-js";
import { reverseGeocode } from "@/lib/services/reverse-geocoding";
import { createAdminClient } from "@/lib/supabase/adminClient";
import { createClient } from "@/lib/supabase/client";
import { POSTER_TYPES } from "../constants/poster-types";
import {
  createPosterPlacement,
  deletePosterPlacement,
  getPosterPlacementById,
  updatePosterPlacementArtifactId,
  updatePosterPlacementFields,
} from "../services/residential-posters";
import { achievePosterPlacementMission } from "../use-cases/achieve-residential-poster-mission";

const POSTER_TYPE_VALUES = new Set<string>(
  POSTER_TYPES.map((type) => type.value),
);

function isValidPosterType(value: string | null): boolean {
  return value !== null && POSTER_TYPE_VALUES.has(value);
}

async function requireAuth(): Promise<User> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("認証が必要です");
  return user;
}

/**
 * ポスター掲示を登録する Server Action
 */
export async function submitPosterPlacement(params: {
  lat: number;
  lng: number;
  count: number;
  address: string | null;
  memo: string | null;
  placed_date: string | null;
  location_type: string | null;
  poster_type: string | null;
  is_removed: boolean;
}): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    const user = await requireAuth();
    if (!isValidPosterType(params.poster_type)) {
      return { success: false, error: "ポスターの種類を選択してください" };
    }
    const geo = await reverseGeocode(params.lat, params.lng);
    // 1. ポスター掲示レコードを作成（既存処理）
    const record = await createPosterPlacement({
      user_id: user.id,
      lat: params.lat,
      lng: params.lng,
      count: params.count,
      prefecture: geo.prefecture,
      city: geo.city,
      address: params.address ?? geo.address,
      postcode: geo.postcode,
      memo: params.memo,
      placed_date: params.placed_date,
      location_type: params.location_type,
      poster_type: params.poster_type,
      is_removed: params.is_removed,
    });

    // 2. ミッション達成処理（achievement + mission_artifact + XP 付与）
    const adminSupabase = await createAdminClient();
    const missionResult = await achievePosterPlacementMission(adminSupabase, {
      userId: user.id,
      prefecture: geo.prefecture,
      city: geo.city,
      count: params.count,
    });

    // 3. residential_poster_placements.mission_artifact_id を更新して紐付け
    if (missionResult.success) {
      try {
        await updatePosterPlacementArtifactId(
          record.id,
          missionResult.artifactId,
        );
      } catch (linkError) {
        // 紐付け失敗は致命的エラーにしない（achievement は作成済み）
        console.error(
          "Failed to link poster placement to artifact:",
          linkError,
        );
      }
    } else {
      // ミッション達成失敗はログに記録するが、ポスター掲示自体は成功とする
      console.error(
        "Failed to achieve poster placement mission:",
        missionResult.error,
      );
    }

    return { success: true, id: record.id };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "登録に失敗しました";
    return { success: false, error: message };
  }
}

/**
 * ポスター掲示を更新する Server Action
 */
export async function updatePosterPlacement(
  id: string,
  params: {
    count: number;
    address: string | null;
    memo: string | null;
    placed_date: string | null;
    location_type: string | null;
    poster_type: string | null;
    is_removed: boolean;
  },
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const user = await requireAuth();
    if (!isValidPosterType(params.poster_type)) {
      return { success: false, error: "ポスターの種類を選択してください" };
    }
    const record = await getPosterPlacementById(id);
    if (!record) {
      return { success: false, error: "レコードが見つかりません" };
    }
    if (record.user_id !== user.id) {
      return { success: false, error: "更新する権限がありません" };
    }
    await updatePosterPlacementFields(id, {
      count: params.count,
      address: params.address,
      memo: params.memo,
      placed_date: params.placed_date,
      location_type: params.location_type,
      poster_type: params.poster_type,
      is_removed: params.is_removed,
    });
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "更新に失敗しました";
    return { success: false, error: message };
  }
}

/**
 * ポスター掲示を削除する Server Action
 */
export async function removePosterPlacement(
  id: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const user = await requireAuth();
    const record = await getPosterPlacementById(id);
    if (!record) {
      return { success: false, error: "レコードが見つかりません" };
    }
    if (record.user_id !== user.id) {
      return { success: false, error: "削除する権限がありません" };
    }
    await deletePosterPlacement(id);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "削除に失敗しました";
    return { success: false, error: message };
  }
}
