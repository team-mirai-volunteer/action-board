// TOPページ用のランキングコンポーネント
import { getRanking } from "@/lib/services/ranking";
import BaseRanking from "./base-ranking";
import { RankingItem } from "./ranking-item";

interface RankingTopProps {
  limit?: number;
  showDetailedInfo?: boolean; // 詳細情報を表示するかどうか
}

export default async function RankingTop({
  limit = 10,
  showDetailedInfo = false,
}: RankingTopProps) {
  const rankings = await getRanking(limit);

  return (
    <BaseRanking
      title={`🏅アクションリーダートップ${limit}`}
      detailsHref="/ranking"
      showDetailedInfo={showDetailedInfo}
    >
      {rankings.map((user) => (
        <RankingItem key={user.user_id} user={user} />
      ))}
    </BaseRanking>
  );
}
