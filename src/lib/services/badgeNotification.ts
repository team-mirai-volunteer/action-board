import "server-only";

import {
  getUnnotifiedBadges,
  markBadgesAsNotified,
} from "@/lib/services/badges";
import { createServiceClient } from "@/lib/supabase/server";
import { type UserBadge, getBadgeTitle } from "@/lib/types/badge";

/**
 * バッジ獲得通知をチェックし、必要に応じて通知データを返す
 */
export async function checkBadgeNotifications(userId: string): Promise<{
  hasNewBadges: boolean;
  newBadges?: {
    badge: UserBadge;
    title: string;
    description: string;
  }[];
}> {
  try {
    const unnotifiedBadges = await getUnnotifiedBadges(userId);

    if (unnotifiedBadges.length === 0) {
      return { hasNewBadges: false };
    }

    const newBadges = unnotifiedBadges.map((badge) => ({
      badge,
      title: getBadgeTitle(badge),
      description: `おめでとうございます！${getBadgeTitle(badge)}を獲得しました！`,
    }));

    return {
      hasNewBadges: true,
      newBadges,
    };
  } catch (error) {
    console.error("Error checking badge notifications:", error);
    return { hasNewBadges: false };
  }
}

/**
 * バッジ通知を確認済みとしてマークする
 */
export async function markBadgeNotificationAsSeen(
  badgeIds: string[],
): Promise<{ success: boolean; error?: string }> {
  return markBadgesAsNotified(badgeIds);
}

/**
 * ミッションのタイトルを取得するヘルパー関数
 */
async function getMissionTitle(missionSlug: string): Promise<string> {
  const supabase = await createServiceClient();

  const { data: mission } = await supabase
    .from("missions")
    .select("title")
    .eq("slug", missionSlug)
    .single();

  return mission?.title || missionSlug;
}

/**
 * バッジの詳細説明を生成
 */
export async function getBadgeDescription(badge: UserBadge): Promise<string> {
  let description = "";

  switch (badge.badge_type) {
    case "DAILY":
      description = `本日のデイリーランキングで${badge.rank}位を達成しました！`;
      break;
    case "ALL":
      description = `総合ランキングで${badge.rank}位を達成しました！`;
      break;
    case "PREFECTURE":
      description = `${badge.sub_type}の都道府県ランキングで${badge.rank}位を達成しました！`;
      break;
    case "MISSION": {
      const missionTitle = await getMissionTitle(badge.sub_type || "");
      description = `「${missionTitle}」ミッションのランキングで${badge.rank}位を達成しました！`;
      break;
    }
  }

  return description;
}
