// TOPページ用のランキングコンポーネント
import { getRanking } from "../services/get-ranking";
import { BaseRanking } from "./base-ranking";
import type { RankingPeriod } from "./period-toggle";
import { RankingItem } from "./ranking-item";

interface RankingTopProps {
  title?: string;
  limit?: number;
  showDetailedInfo?: boolean; // 詳細情報を表示するかどうか
  period?: RankingPeriod;
  seasonId?: string; // シーズン指定
}

export async function RankingTop({
  title,
  limit = 10,
  showDetailedInfo = false,
  period = "all",
  seasonId,
}: RankingTopProps) {
  const rankings = await getRanking(limit, period, seasonId);

  const periodLabel = period === "daily" ? "今日の" : "全期間";

  return (
    <BaseRanking
      title={title ?? `🏅${periodLabel}トップ${limit}`}
      detailsHref="/ranking"
      showDetailedInfo={showDetailedInfo}
    >
      {rankings.map((user) => (
        <RankingItem key={user.user_id} user={user} />
      ))}
    </BaseRanking>
  );
}
