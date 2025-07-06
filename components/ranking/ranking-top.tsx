// TOPページ用のランキングコンポーネント
import { getRanking } from "@/lib/services/ranking";
import BaseRanking from "./base-ranking";
import type { RankingPeriod } from "./period-toggle";
import { RankingItem } from "./ranking-item";

interface RankingTopProps {
  limit?: number;
  showDetailedInfo?: boolean; // 詳細情報を表示するかどうか
  period?: RankingPeriod;
}

export default async function RankingTop({
  limit = 10,
  showDetailedInfo = false,
  period = "all",
}: RankingTopProps) {
  const rankings = await getRanking(limit, period);

  const periodLabel =
    period === "weekly" ? "週間" : period === "daily" ? "日次" : "";
  const title = `🏅${periodLabel}アクションリーダートップ${limit}`;

  return (
    <BaseRanking
      title={title}
      detailsHref="/ranking"
      showDetailedInfo={showDetailedInfo}
    >
      {rankings.map((user) => (
        <RankingItem key={user.user_id} user={user} />
      ))}
    </BaseRanking>
  );
}
