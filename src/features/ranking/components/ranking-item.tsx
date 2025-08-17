// TOPページ用のランキングコンポーネント
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { UserMissionRanking, UserRanking } from "../types/ranking-types";
import { getRankIcon } from "./ranking-icon";

interface RankingItemProps {
  user: UserRanking;
  userWithMission?: UserMissionRanking;
  showDetailedInfo?: boolean; // フル版では詳細情報を表示
  mission?: {
    id: string;
    name: string;
  };
  badgeText?: string;
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
  badgeText,
}: RankingItemProps) {
  return (
    <Link
      href={`/users/${user.user_id}`}
      className="flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-4">
        {getRankIcon(user.rank ?? 0)}
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
              {badgeText}
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
