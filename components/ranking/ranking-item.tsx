// TOPページ用のランキングコンポーネント
import { Badge } from "@/components/ui/badge";
import type { UserMissionRanking } from "@/lib/services/missionsRanking";
import type { UserRanking } from "@/lib/services/ranking";
import { Crown, Medal, Trophy } from "lucide-react";
import Link from "next/link";

interface RankingItemProps {
  user: UserRanking;
  userWithMission?: UserMissionRanking;
  showDetailedInfo?: boolean; // フル版では詳細情報を表示
  mission?: {
    id: string;
    name: string;
  };
  userPostingCount?: number;
  postingMission?: boolean;
}

function getRankIcon(rank: number | null) {
  const displayRank = rank ?? 0;

  switch (displayRank) {
    case 1:
      return <Crown className="w-6 h-6 text-yellow-500" />;
    case 2:
      return <Trophy className="w-6 h-6 text-gray-400" />;
    case 3:
      return <Medal className="w-6 h-6 text-orange-500" />;
    default:
      return (
        <div className="w-6 h-6 flex items-center justify-center text-gray-600 font-bold">
          {displayRank}
        </div>
      );
  }
}

function getLevelBadgeColor(level: number | null) {
  const displayLevel = level ?? 0;

  if (displayLevel >= 40) return "bg-emerald-100 text-emerald-700";
  if (displayLevel >= 30) return "bg-emerald-100 text-emerald-700";
  if (displayLevel >= 20) return "bg-emerald-100 text-emerald-700";
  if (displayLevel >= 10) return "bg-emerald-100 text-emerald-700";
  return "text-emerald-700 bg-emerald-100";
}

export function RankingItem({
  user,
  userWithMission,
  showDetailedInfo = false,
  mission,
  userPostingCount,
  postingMission,
}: RankingItemProps) {
  return (
    <Link
      href={`/users/${user.user_id}`}
      className="flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-4">
        {getRankIcon(user.rank)}
        <div>
          <div className="font-bold text-lg">{user.name}</div>
          <div className="text-sm text-gray-600">{user.address_prefecture}</div>
          {showDetailedInfo && (
            <div className="text-xs text-gray-500 mt-1">ID: {user.user_id}</div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {/* ミッション別ランキングの場合はポイントと達成回数を表示 */}
        {mission ? (
          <>
            <Badge
              className={
                "bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full"
              }
            >
              {/* ポスティングミッションの場合はポスティング枚数を表示 */}
              {(postingMission
                ? (userPostingCount ?? 0)
                : (userWithMission?.user_achievement_count ?? 0)
              ).toLocaleString()}
              {postingMission ? "枚" : "回"}
            </Badge>
            <span className="font-bold text-lg">
              {(userWithMission?.total_points ?? 0).toLocaleString()}pt
            </span>
          </>
        ) : (
          <>
            <Badge
              className={`${getLevelBadgeColor(user.level)} px-3 py-1 rounded-full`}
            >
              Lv.{user.level}
            </Badge>
            <div className="text-right">
              <div className="font-bold text-lg">
                {(user.xp ?? 0).toLocaleString()}pt
              </div>
            </div>
          </>
        )}
      </div>
    </Link>
  );
}
