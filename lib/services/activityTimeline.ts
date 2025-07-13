/**
 * 活動タイムラインサービス
 *
 * このサービスは以下の機能を提供します：
 * - ユーザーのミッション達成とアクティビティの統合表示
 * - 時系列順でのデータソート
 * - ページネーション対応
 * - エラーハンドリング
 *
 * データソース：
 * - achievements テーブル（ミッション達成）
 * - user_activities テーブル（ユーザー活動）
 * - public_user_profiles テーブル（ユーザー情報）
 *
 * パフォーマンス最適化：
 * - Promise.allによる並列データ取得
 * - 適切なrange指定によるデータ量制限
 * - メモリ効率的なデータ統合処理
 */
import "server-only";

import { createClient } from "@/lib/supabase/server";

/**
 * 活動タイムラインアイテムの型定義
 *
 * ミッション達成とユーザーアクティビティを統合した
 * 標準化されたデータ構造を定義します。
 */
export interface ActivityTimelineItem {
  /** 一意識別子（achievement_${id} または activity_${id} 形式） */
  id: string;
  /** ユーザーID */
  user_id: string;
  /** ユーザー名 */
  name: string;
  /** 都道府県（任意） */
  address_prefecture: string | null;
  /** アバター画像URL（任意） */
  avatar_url: string | null;
  /** 活動タイトル（ミッション名またはアクティビティ名） */
  title: string;
  /** 作成日時（ISO 8601形式） */
  created_at: string;
  /** 活動タイプ（mission_achievement, signup等） */
  activity_type: string;
}

/**
 * ユーザーの活動タイムラインを取得する
 * ミッション達成とユーザーアクティビティを統合して時系列順に返す
 * @param userId - 対象ユーザーのID
 * @param limit - 取得する最大件数（デフォルト: 20）
 * @param offset - 取得開始位置（デフォルト: 0）
 * @returns 活動タイムラインアイテムの配列
 */
export async function getUserActivityTimeline(
  userId: string,
  limit = 20,
  offset = 0,
): Promise<ActivityTimelineItem[]> {
  const supabase = await createClient();

  const [achievementsResult, activitiesResult, userProfileResult] =
    await Promise.all([
      // ミッション達成データの取得
      supabase
        .from("achievements")
        .select("id, created_at, user_id, missions!inner(title)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + Math.ceil(limit / 2) - 1),

      // ユーザーアクティビティデータの取得
      supabase
        .from("user_activities")
        .select("id, created_at, activity_title, activity_type, user_id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + Math.ceil(limit / 2) - 1),

      supabase
        .from("public_user_profiles")
        .select("id, name, address_prefecture, avatar_url")
        .eq("id", userId)
        .single(),
    ]);

  if (achievementsResult.error) {
    console.error("Failed to fetch achievements:", achievementsResult.error);
    return [];
  }

  if (activitiesResult.error) {
    console.error("Failed to fetch user activities:", activitiesResult.error);
    return [];
  }

  const userProfile = userProfileResult.data;

  const achievements = (achievementsResult.data || []).map((a) => ({
    id: `achievement_${a.id}`,
    user_id: userId,
    name: userProfile?.name || "",
    address_prefecture: userProfile?.address_prefecture || null,
    avatar_url: userProfile?.avatar_url || null,
    title: a.missions.title,
    created_at: a.created_at,
    activity_type: "mission_achievement",
  }));

  const activities = (activitiesResult.data || []).map((a) => ({
    id: `activity_${a.id}`,
    user_id: userId,
    name: userProfile?.name || "",
    address_prefecture: userProfile?.address_prefecture || null,
    avatar_url: userProfile?.avatar_url || null,
    title: a.activity_title,
    created_at: a.created_at,
    activity_type: a.activity_type,
  }));

  return [...achievements, ...activities]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, limit);
}

/**
 * ユーザーの活動総数を取得する
 *
 * この関数は以下の処理を行います：
 * - achievementsテーブルとuser_activitiesテーブルの件数を並列取得
 * - 両方の件数を合計してページネーション用の総数を返す
 * - エラー時は0を返して安全にフォールバック
 *
 * @param userId - 対象ユーザーのID
 * @returns 活動の総数（ミッション達成 + ユーザーアクティビティ）
 */
export async function getUserActivityTimelineCount(
  userId: string,
): Promise<number> {
  const supabase = await createClient();

  const [achievementsCount, activitiesCount] = await Promise.all([
    supabase
      .from("achievements")
      .select("*", { count: "exact" })
      .eq("user_id", userId),
    supabase
      .from("user_activities")
      .select("*", { count: "exact" })
      .eq("user_id", userId),
  ]);

  return (achievementsCount.count || 0) + (activitiesCount.count || 0);
}
