// TOPページ用のランキングコンポーネント
import {
  getMissionRanking,
  getTopUsersPostingCount,
} from "@/lib/services/missionsRanking";
import type { Tables } from "@/lib/types/supabase";
import BaseRanking from "./base-ranking";
import type { RankingPeriod } from "./period-toggle";
import { RankingItem } from "./ranking-item";

interface RankingTopProps {
  limit?: number;
  showDetailedInfo?: boolean; // 詳細情報を表示するかどうか
  mission?: Tables<"missions">;
  isPostingMission?: boolean;
  period?: RankingPeriod;
}

export default async function RankingMission({
  mission,
  limit = 10,
  showDetailedInfo = false,
  isPostingMission,
  period = "all",
}: RankingTopProps) {
  if (!mission) {
    return null;
  }

  const rankings = await getMissionRanking(mission.id, limit, period);

  const rankingMap = new Map(rankings.map((item) => [item.user_id, item]));

  // ポスティングミッションの場合のみ、上位ユーザーの投稿数を取得
  const topUsersPostingCount =
    isPostingMission && rankings.length > 0
      ? await getTopUsersPostingCount(
          rankings.map((user) => user.user_id ?? ""),
        )
      : [];

  const topUsersPostingCountMap = new Map(
    topUsersPostingCount.map((user) => [user.user_id, user.posting_count]),
  );

  const badgeText = (userId: string) => {
    const rankingItem = rankingMap.get(userId);
    const postingCount = topUsersPostingCountMap.get(userId);
    if (isPostingMission) {
      return `${(postingCount ?? 0).toLocaleString()}枚`;
    }
    return `${(rankingItem?.user_achievement_count ?? 0).toLocaleString()}回`;
  };

  const periodLabel = period === "daily" ? "日次" : "";
  const title = `🏅「${mission.title}」${periodLabel}トップ${limit}`;

  return (
    <BaseRanking
      title={title}
      detailsHref={`/ranking/ranking-mission?missionId=${mission.id}`}
      showDetailedInfo={showDetailedInfo}
    >
      {rankings.map((user) => (
        <RankingItem
          key={user.user_id}
          user={user}
          userWithMission={user}
          mission={
            mission ? { id: mission.id, name: mission.title } : undefined
          }
          badgeText={badgeText(user.user_id || "")}
        />
      ))}
    </BaseRanking>
  );
}
