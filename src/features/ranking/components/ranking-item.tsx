import Link from "next/link";
import { Badge } from "@/components/ui/badge";
// TOPページ用のランキングコンポーネント
import { UserNameWithBadge } from "@/features/party-membership/components/user-name-with-badge";
import { formatNumberJa } from "@/lib/utils/format-number-ja";
import type { UserMissionRanking, UserRanking } from "../types/ranking-types";
import { getLevelBadgeColor } from "../utils/level-badge-styles";
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
        <div className="text-sm text-gray-600">
          {user.address_prefecture}
          {!mission && (
            <span
              className={`ml-1.5 ${getLevelBadgeColor(user.level)} px-1.5 py-0.5 rounded text-xs font-medium`}
            >
              Lv.{user.level}
            </span>
          )}
        </div>
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
        <div className="font-bold text-lg justify-self-end">
          {formatNumberJa(user.xp ?? 0)}pt
        </div>
      )}
    </Link>
  );
}
