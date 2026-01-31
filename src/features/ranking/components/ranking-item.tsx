import { Badge } from "@/components/ui/badge";
// TOPページ用のランキングコンポーネント
import { UserNameWithBadge } from "@/features/party-membership/components/user-name-with-badge";
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
      className="grid grid-cols-subgrid col-span-full items-center gap-4 py-3 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors cursor-pointer"
    >
      {getRankIcon(user.rank ?? 0)}
      <div className="min-w-0 pl-1">
        <UserNameWithBadge
          name={user.name ?? ""}
          membership={user.party_membership ?? null}
          nameClassName="font-bold text-lg"
          badgeSize={20}
        />
        <div className="text-sm text-gray-600">{user.address_prefecture}</div>
        {showDetailedInfo && (
          <div className="text-xs text-gray-500 mt-1">ID: {user.user_id}</div>
        )}
      </div>
      {/* ミッション別ランキングの場合はポイントと達成回数を表示 */}
      {mission ? (
        <>
          <Badge
            className={
              "bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full w-fit justify-self-end"
            }
          >
            {badgeText}
          </Badge>
          <span className="font-bold text-lg justify-self-end">
            {(userWithMission?.total_points ?? 0).toLocaleString()}pt
          </span>
        </>
      ) : (
        <>
          <Badge
            className={`${getLevelBadgeColor(user.level)} px-3 py-1 rounded-full w-fit justify-self-end`}
          >
            Lv.{user.level}
          </Badge>
          <div className="font-bold text-lg justify-self-end">
            {(user.xp ?? 0).toLocaleString()}pt
          </div>
        </>
      )}
    </Link>
  );
}
