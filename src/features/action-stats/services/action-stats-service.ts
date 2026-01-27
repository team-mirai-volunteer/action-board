import "server-only";

import { createClient } from "@/lib/supabase/client";
import { getJstRecentDates, toJstDateString } from "@/lib/utils/date-utils";
import type {
  ActionStatsSummary,
  DailyActionItem,
  MissionActionRanking,
} from "../types";

/**
 * アクション統計のサマリーを取得する
 * @param startDate - 開始日（オプション）
 * @param endDate - 終了日（オプション）
 * @returns サマリー統計
 */
export async function getActionStatsSummary(
  startDate?: Date,
  endDate?: Date,
): Promise<ActionStatsSummary> {
  const supabase = createClient();
  const { today, yesterday } = getJstRecentDates();

  // 期間内のアクション総数を取得
  let achievementsQuery = supabase
    .from("achievements")
    .select("id, created_at");

  if (startDate) {
    achievementsQuery = achievementsQuery.gte(
      "created_at",
      startDate.toISOString(),
    );
  }
  if (endDate) {
    const endOfDay = new Date(endDate);
    endOfDay.setDate(endOfDay.getDate() + 1);
    achievementsQuery = achievementsQuery.lt(
      "created_at",
      endOfDay.toISOString(),
    );
  }

  const { data: achievements, error: achievementsError } =
    await achievementsQuery;

  if (achievementsError) {
    console.error("Failed to fetch achievements:", achievementsError);
    return {
      totalActions: 0,
      activeUsers: 0,
      dailyActionsIncrease: 0,
      dailyActiveUsersIncrease: 0,
    };
  }

  const totalActions = achievements?.length ?? 0;

  // 期間内のアクティブユーザー数を取得
  let usersQuery = supabase.from("achievements").select("user_id");

  if (startDate) {
    usersQuery = usersQuery.gte("created_at", startDate.toISOString());
  }
  if (endDate) {
    const endOfDay = new Date(endDate);
    endOfDay.setDate(endOfDay.getDate() + 1);
    usersQuery = usersQuery.lt("created_at", endOfDay.toISOString());
  }

  const { data: userAchievements, error: usersError } = await usersQuery;

  if (usersError) {
    console.error("Failed to fetch user achievements:", usersError);
    return {
      totalActions,
      activeUsers: 0,
      dailyActionsIncrease: 0,
      dailyActiveUsersIncrease: 0,
    };
  }

  // ユニークユーザー数を計算
  const uniqueUserIds = new Set(
    userAchievements?.map((a) => a.user_id).filter(Boolean) ?? [],
  );
  const activeUsers = uniqueUserIds.size;

  // 今日と昨日のアクション数を計算
  let todayCount = 0;
  let yesterdayCount = 0;
  const todayUsers = new Set<string>();
  const yesterdayUsers = new Set<string>();

  // 今日と昨日のアクションをカウントするため全期間のデータを取得
  const { data: recentAchievements } = await supabase
    .from("achievements")
    .select("created_at, user_id")
    .gte("created_at", new Date(yesterday).toISOString());

  for (const achievement of recentAchievements ?? []) {
    const dateStr = toJstDateString(new Date(achievement.created_at));
    if (dateStr === today) {
      todayCount++;
      if (achievement.user_id) todayUsers.add(achievement.user_id);
    } else if (dateStr === yesterday) {
      yesterdayCount++;
      if (achievement.user_id) yesterdayUsers.add(achievement.user_id);
    }
  }

  // 今日のデータがなければ昨日のデータを使用
  const dailyActionsIncrease = todayCount > 0 ? todayCount : yesterdayCount;
  const dailyActiveUsersIncrease =
    todayCount > 0 ? todayUsers.size : yesterdayUsers.size;

  return {
    totalActions,
    activeUsers,
    dailyActionsIncrease,
    dailyActiveUsersIncrease,
  };
}

/**
 * 日別アクション数を取得する
 * @param startDate - 開始日（オプション）
 * @param endDate - 終了日（オプション）
 * @returns 日別アクション数の配列
 */
export async function getDailyActionStats(
  startDate?: Date,
  endDate?: Date,
): Promise<DailyActionItem[]> {
  const supabase = createClient();

  // daily_action_summaryテーブルから取得を試みる
  let query = supabase
    .from("daily_action_summary")
    .select("date, count")
    .order("date", { ascending: true });

  if (startDate) {
    query = query.gte("date", startDate.toISOString().split("T")[0]);
  }
  if (endDate) {
    query = query.lte("date", endDate.toISOString().split("T")[0]);
  }

  const { data: summaryData, error: summaryError } = await query;

  if (!summaryError && summaryData && summaryData.length > 0) {
    return summaryData.map((item) => ({
      date: item.date,
      count: item.count,
    }));
  }

  // daily_action_summaryが空の場合、achievementsから集計
  let achievementsQuery = supabase
    .from("achievements")
    .select("created_at")
    .order("created_at", { ascending: true });

  if (startDate) {
    achievementsQuery = achievementsQuery.gte(
      "created_at",
      startDate.toISOString(),
    );
  }
  if (endDate) {
    const endOfDay = new Date(endDate);
    endOfDay.setDate(endOfDay.getDate() + 1);
    achievementsQuery = achievementsQuery.lt(
      "created_at",
      endOfDay.toISOString(),
    );
  }

  const { data: achievements, error: achievementsError } =
    await achievementsQuery;

  if (achievementsError) {
    console.error(
      "Failed to fetch achievements for daily stats:",
      achievementsError,
    );
    return [];
  }

  // 日別に集計（JSTで日付を判定）
  const dailyCount = new Map<string, number>();
  for (const achievement of achievements ?? []) {
    const date = toJstDateString(new Date(achievement.created_at));
    dailyCount.set(date, (dailyCount.get(date) || 0) + 1);
  }

  // 開始日から終了日までの日付を生成
  const effectiveStartDate = startDate || new Date("2025-01-01");
  const effectiveEndDate = endDate || new Date();
  effectiveEndDate.setHours(0, 0, 0, 0);

  const result: DailyActionItem[] = [];
  const currentDate = new Date(effectiveStartDate);

  while (currentDate <= effectiveEndDate) {
    const dateStr = currentDate.toISOString().split("T")[0];
    result.push({
      date: dateStr,
      count: dailyCount.get(dateStr) || 0,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return result;
}

/**
 * ミッション別アクションランキングを取得する
 * @param startDate - 開始日（オプション）
 * @param endDate - 終了日（オプション）
 * @param limit - 取得件数（デフォルト20）
 * @returns ミッション別アクションランキング
 */
export async function getMissionActionRanking(
  startDate?: Date,
  endDate?: Date,
  limit = 20,
): Promise<MissionActionRanking[]> {
  const supabase = createClient();

  // achievementsからミッション別の集計を取得
  let query = supabase.from("achievements").select("mission_id");

  if (startDate) {
    query = query.gte("created_at", startDate.toISOString());
  }
  if (endDate) {
    const endOfDay = new Date(endDate);
    endOfDay.setDate(endOfDay.getDate() + 1);
    query = query.lt("created_at", endOfDay.toISOString());
  }

  const { data: achievements, error: achievementsError } = await query;

  if (achievementsError) {
    console.error(
      "Failed to fetch achievements for ranking:",
      achievementsError,
    );
    return [];
  }

  // ミッション別に集計
  const missionCounts = new Map<string, number>();
  for (const achievement of achievements ?? []) {
    if (achievement.mission_id) {
      missionCounts.set(
        achievement.mission_id,
        (missionCounts.get(achievement.mission_id) || 0) + 1,
      );
    }
  }

  // ミッションIDの配列を取得
  const missionIds = Array.from(missionCounts.keys());

  if (missionIds.length === 0) {
    return [];
  }

  // ミッション情報を取得
  const { data: missions, error: missionsError } = await supabase
    .from("missions")
    .select("id, title, slug, icon_url")
    .in("id", missionIds)
    .eq("is_hidden", false);

  if (missionsError) {
    console.error("Failed to fetch missions:", missionsError);
    return [];
  }

  // ランキングを作成
  const rankings: MissionActionRanking[] = (missions ?? [])
    .map((mission) => ({
      missionId: mission.id,
      title: mission.title,
      slug: mission.slug,
      iconUrl: mission.icon_url,
      achievementCount: missionCounts.get(mission.id) || 0,
    }))
    .sort((a, b) => b.achievementCount - a.achievementCount)
    .slice(0, limit);

  return rankings;
}

/**
 * アクション総数を取得する
 * @param startDate - 開始日（オプション）
 * @param endDate - 終了日（オプション）
 * @returns アクション総数
 */
export async function getActionCount(
  startDate?: Date,
  endDate?: Date,
): Promise<number> {
  const supabase = createClient();

  let query = supabase
    .from("achievements")
    .select("*", { count: "exact", head: true });

  if (startDate) {
    query = query.gte("created_at", startDate.toISOString());
  }
  if (endDate) {
    const endOfDay = new Date(endDate);
    endOfDay.setDate(endOfDay.getDate() + 1);
    query = query.lt("created_at", endOfDay.toISOString());
  }

  const { count, error } = await query;

  if (error) {
    console.error("Failed to fetch action count:", error);
    return 0;
  }

  return count || 0;
}
