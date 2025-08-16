"server-only";

import { createServiceClient } from "@/lib/supabase/server";
import type { BadgeUpdateParams, UserBadge } from "@/lib/types/badge";

/**
 * ミッションバッジにタイトル情報を追加する
 */
async function enrichMissionBadges(badges: UserBadge[]): Promise<UserBadge[]> {
  // ミッションタイプのバッジのミッションslugを収集
  const missionSlugs = badges
    .filter((badge) => badge.badge_type === "MISSION" && badge.sub_type)
    .map((badge) => badge.sub_type as string);

  if (missionSlugs.length === 0) {
    return badges;
  }

  const supabase = await createServiceClient();

  // ミッション情報を取得（IDも含める）
  const { data: missions, error: missionError } = await supabase
    .from("missions")
    .select("id, slug, title")
    .in("slug", missionSlugs);

  if (missionError || !missions) {
    console.error("Error fetching mission titles:", missionError);
    return badges;
  }

  // ミッションslugとミッション情報のマップを作成
  const missionMap = new Map(
    missions.map((m) => [m.slug, { id: m.id, title: m.title }]),
  );

  // バッジにミッションタイトルとIDを追加
  return badges.map((badge) => {
    if (badge.badge_type === "MISSION" && badge.sub_type) {
      const missionInfo = missionMap.get(badge.sub_type);
      if (missionInfo) {
        return {
          ...badge,
          mission_title: missionInfo.title,
          mission_id: missionInfo.id,
        };
      }
    }
    return badge;
  });
}

/**
 * バッジを更新する（順位が改善された場合のみ）
 */
export async function updateBadge({
  user_id,
  badge_type,
  sub_type,
  rank,
}: BadgeUpdateParams): Promise<{ success: boolean; updated: boolean }> {
  const supabase = await createServiceClient();

  try {
    // 既存バッジを確認
    const query = supabase
      .from("user_badges")
      .select("*")
      .eq("user_id", user_id)
      .eq("badge_type", badge_type);

    // sub_typeがnullの場合とそうでない場合で処理を分ける
    if (sub_type === null) {
      query.is("sub_type", null);
    } else {
      query.eq("sub_type", sub_type);
    }

    const { data: existing, error: fetchError } = await query.single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Error fetching existing badge:", fetchError);
      return { success: false, updated: false };
    }

    if (!existing) {
      // 新規作成
      const { error: insertError } = await supabase.from("user_badges").insert({
        user_id,
        badge_type,
        sub_type,
        rank,
        achieved_at: new Date().toISOString(),
        is_notified: false,
      });

      if (insertError) {
        console.error("Error inserting new badge:", insertError);
        return { success: false, updated: false };
      }

      return { success: true, updated: true };
    }

    if (rank < existing.rank) {
      // 順位が改善された場合のみ更新
      const { error: updateError } = await supabase
        .from("user_badges")
        .update({
          rank,
          achieved_at: new Date().toISOString(),
          is_notified: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateError) {
        console.error("Error updating badge:", updateError);
        return { success: false, updated: false };
      }

      return { success: true, updated: true };
    }

    // 順位が改善されていない場合
    return { success: true, updated: false };
  } catch (error) {
    console.error("Unexpected error in updateBadge:", error);
    return { success: false, updated: false };
  }
}

/**
 * ユーザーの現在のバッジを取得（ミッション情報付き）
 */
export async function getUserBadges(
  userId: string,
  seasonId?: string,
): Promise<UserBadge[]> {
  const supabase = await createServiceClient();

  let query = supabase.from("user_badges").select("*").eq("user_id", userId);

  // seasonIdが指定された場合はそのシーズンのバッジのみ取得
  if (seasonId) {
    query = query.eq("season_id", seasonId);
  }

  const { data, error } = await query.order("badge_type").order("rank");

  if (error) {
    console.error("Error fetching user badges:", error);
    return [];
  }

  const badges = (data || []) as UserBadge[];

  // ミッションバッジのタイトルを取得
  return enrichMissionBadges(badges);
}

/**
 * ユーザーの最高ランクのバッジを取得（ミッション情報付き）
 */
export async function getUserTopBadge(
  userId: string,
  seasonId?: string,
): Promise<UserBadge | null> {
  const badges = await getUserBadges(userId, seasonId);

  if (badges.length === 0) {
    return null;
  }

  // ランクが最も高い（数値が小さい）バッジを返す
  return badges.reduce((topBadge, currentBadge) =>
    currentBadge.rank < topBadge.rank ? currentBadge : topBadge,
  );
}

/**
 * 未通知のバッジを取得
 */
export async function getUnnotifiedBadges(
  userId: string,
): Promise<UserBadge[]> {
  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from("user_badges")
    .select("*")
    .eq("user_id", userId)
    .eq("is_notified", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching unnotified badges:", error);
    return [];
  }

  const badges = (data || []) as UserBadge[];

  // ミッションバッジのタイトルを取得
  return enrichMissionBadges(badges);
}

/**
 * バッジを通知済みにマーク
 */
export async function markBadgesAsNotified(
  badgeIds: string[],
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServiceClient();

  try {
    const { error } = await supabase
      .from("user_badges")
      .update({
        is_notified: true,
        updated_at: new Date().toISOString(),
      })
      .in("id", badgeIds);

    if (error) {
      console.error("Error marking badges as notified:", error);
      return { success: false, error: "バッジの通知状態の更新に失敗しました" };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error in markBadgesAsNotified:", error);
    return { success: false, error: "予期しないエラーが発生しました" };
  }
}
