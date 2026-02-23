// TOPページ用のランキングコンポーネント
import { getPrefecturesRanking } from "../loaders/ranking-loaders";
import { BaseRanking } from "./base-ranking";
import { RankingItem } from "./ranking-item";

interface RankingPrefectureProps {
  limit?: number;
  showDetailedInfo?: boolean; // 詳細情報を表示するかどうか
  prefecture?: string;
  seasonId?: string; // シーズン指定
}

export async function RankingPrefecture({
  prefecture,
  limit = 10,
  showDetailedInfo = false,
  seasonId,
}: RankingPrefectureProps) {
  if (!prefecture) {
    return null;
  }

  const rankings = await getPrefecturesRanking(
    prefecture,
    limit,
    "all",
    seasonId,
  );

  const title = `🏅${prefecture}トップ${limit}`;

  return (
    <BaseRanking
      title={title}
      detailsHref={`/ranking/ranking-prefecture?prefecture=${prefecture}`}
      showDetailedInfo={showDetailedInfo}
      columns={3}
    >
      {rankings.map((user) => (
        <RankingItem key={user.user_id} user={user} />
      ))}
    </BaseRanking>
  );
}
