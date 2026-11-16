// TOPページ用のランキングコンポーネント
import { getRanking } from "../loaders/ranking-loaders";
import { BaseRanking } from "./base-ranking";
import type { RankingPeriod } from "./period-toggle";
import { RankingItem } from "./ranking-item";

interface RankingTopProps {
  title?: string;
  limit?: number;
  showDetailedInfo?: boolean; // 詳細情報を表示するかどうか
  period?: RankingPeriod;
  seasonId?: string; // シーズン指定
  compact?: boolean; // トップページ用のコンパクト表示
}

export async function RankingTop({
  title,
  limit = 10,
  showDetailedInfo = false,
  period = "all",
  seasonId,
  compact = false,
}: RankingTopProps) {
  const rankings = await getRanking(limit, period, seasonId);

  const periodLabel = period === "daily" ? "今日の" : "全期間";

  return (
    <BaseRanking
      title={title ?? `🏅${periodLabel}トップ${limit}`}
      detailsHref="/ranking"
      showDetailedInfo={showDetailedInfo}
      columns={3}
      compact={compact}
    >
      {rankings.map((user) => (
        <RankingItem key={user.user_id} user={user} compact={compact} />
      ))}
    </BaseRanking>
  );
}
