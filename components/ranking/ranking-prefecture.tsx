// TOPページ用のランキングコンポーネント
import { getPrefecturesRanking } from "@/lib/services/prefecturesRanking";
import BaseRanking from "./base-ranking";
import type { RankingPeriod } from "./period-toggle";
import { RankingItem } from "./ranking-item";

interface RankingPrefectureProps {
  limit?: number;
  showDetailedInfo?: boolean; // 詳細情報を表示するかどうか
  prefecture?: string;
  period?: RankingPeriod;
}

export default async function RankingPrefecture({
  prefecture,
  limit = 10,
  showDetailedInfo = false,
  period = "daily",
}: RankingPrefectureProps) {
  if (!prefecture) {
    return null;
  }

  const rankings = await getPrefecturesRanking(prefecture, limit, period);

  const title = `🏅${prefecture}トップ${limit}`;

  return (
    <BaseRanking
      title={title}
      detailsHref={`/ranking/ranking-prefecture?prefecture=${prefecture}`}
      showDetailedInfo={showDetailedInfo}
    >
      {rankings.map((user) => (
        <RankingItem key={user.user_id} user={user} />
      ))}
    </BaseRanking>
  );
}
