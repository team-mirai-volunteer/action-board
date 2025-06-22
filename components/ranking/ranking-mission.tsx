// TOPページ用のランキングコンポーネント
import { Card } from "@/components/ui/card";
import {
  getMissionRanking,
  getTopUsersPostingCount,
} from "@/lib/services/missionsRanking";
import type { Tables } from "@/lib/types/supabase";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { RankingItem } from "./ranking-item";

interface RankingTopProps {
  limit?: number;
  showDetailedInfo?: boolean; // 詳細情報を表示するかどうか
  mission?: Tables<"missions">;
  isPostingMission?: boolean;
}

export default async function RankingMission({
  mission,
  limit = 10,
  showDetailedInfo = false,
  isPostingMission,
}: RankingTopProps) {
  if (!mission) {
    return null;
  }

  const rankings = await getMissionRanking(mission.id, limit);

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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col gap-6">
        <div className="">
          <h2 className="text-xl md:text-4xl text-gray-900 mb-2 text-center">
            🏅「{mission.title}」トップ{limit}
          </h2>
        </div>

        <Card className="border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 bg-white">
          <div className="space-y-1">
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
          </div>
        </Card>
        {showDetailedInfo && (
          <Link
            href={`/ranking/ranking-mission?missionId=${mission.id}`}
            className="flex items-center text-teal-600 hover:text-teal-700 self-center"
          >
            トップ100を見る
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        )}
      </div>
    </div>
  );
}
