// TOPページ用のランキングコンポーネント
import { getPrefecturesRanking } from "@/lib/services/prefecturesRanking";
import BaseRanking from "./base-ranking";
import { RankingItem } from "./ranking-item";

interface RankingPrefectureProps {
  limit?: number;
  showDetailedInfo?: boolean; // 詳細情報を表示するかどうか
  prefecture?: string;
}

export default async function RankingPrefecture({
  prefecture,
  limit = 10,
  showDetailedInfo = false,
}: RankingPrefectureProps) {
  if (!prefecture) {
    return null;
  }

  const rankings = await getPrefecturesRanking(prefecture, limit);

  return (
    <BaseRanking
      title={`🏅${prefecture}トップ${limit}`}
      detailsHref={`/ranking/ranking-prefecture?prefecture=${prefecture}`}
      showDetailedInfo={showDetailedInfo}
    >
      {rankings.map((user) => (
        <RankingItem key={user.user_id} user={user} />
      ))}
    </BaseRanking>
  );
}
