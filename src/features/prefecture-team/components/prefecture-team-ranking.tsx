import { Card } from "@/components/ui/card";
import { getPrefectureTeamRanking } from "../services/get-prefecture-team-ranking";
import { PrefectureTeamItem } from "./prefecture-team-item";

interface PrefectureTeamRankingProps {
  seasonId?: string;
  userPrefecture?: string | null;
}

export async function PrefectureTeamRanking({
  seasonId,
  userPrefecture,
}: PrefectureTeamRankingProps) {
  const rankings = await getPrefectureTeamRanking(seasonId);

  if (rankings.length === 0) {
    return (
      <Card className="p-8 text-center text-gray-500">
        まだデータがありません
      </Card>
    );
  }

  return (
    <Card className="border-2 border-gray-200 rounded-2xl p-4 md:p-6">
      {/* テーブルヘッダー */}
      <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-2 md:gap-x-4 text-xs md:text-sm text-gray-500 px-2 pb-2 border-b">
        <div className="w-8 text-center">順位</div>
        <div>都道府県</div>
        <div className="text-right">チームパワー</div>
      </div>
      {/* ランキングアイテム */}
      <div className="divide-y">
        {rankings.map((item) => (
          <PrefectureTeamItem
            key={item.prefecture}
            ranking={item}
            isUserPrefecture={item.prefecture === userPrefecture}
          />
        ))}
      </div>
    </Card>
  );
}
