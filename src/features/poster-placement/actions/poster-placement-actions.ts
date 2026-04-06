"use server";

import type { User } from "@supabase/supabase-js";
import { reverseGeocode } from "@/features/map-posting/services/reverse-geocoding";
import { createAdminClient } from "@/lib/supabase/adminClient";
import { createClient } from "@/lib/supabase/client";
import {
  createPosterPlacement,
  deletePosterPlacement,
  getPosterPlacementById,
  updatePosterPlacementArtifactId,
} from "../services/poster-placements";
import { achievePosterPlacementMission } from "../use-cases/achieve-poster-placement-mission";

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
}): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    const user = await requireAuth();
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
    });

    // 2. ミッション達成処理（achievement + mission_artifact + XP 付与）
    const adminSupabase = await createAdminClient();
    const missionResult = await achievePosterPlacementMission(adminSupabase, {
      userId: user.id,
      prefecture: geo.prefecture,
      city: geo.city,
      count: params.count,
    });

    // 3. poster_placements.mission_artifact_id を更新して紐付け
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
