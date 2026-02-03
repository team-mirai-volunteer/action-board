import Link from "next/link";
import { getRankIcon } from "@/features/ranking/components/ranking-icon";
import { getPopulationInTenThousand } from "@/lib/constants/prefecture-populations";
import { cn } from "@/lib/utils";
import type { PrefectureTeamRanking } from "../types/prefecture-team-types";

interface PrefectureTeamItemProps {
  ranking: PrefectureTeamRanking;
  isUserPrefecture?: boolean;
}

export function PrefectureTeamItem({
  ranking,
  isUserPrefecture = false,
}: PrefectureTeamItemProps) {
  return (
    <Link
      href={`/ranking/ranking-prefecture?prefecture=${encodeURIComponent(ranking.prefecture)}`}
      className="block"
    >
      <div
        className={cn(
          "grid grid-cols-[auto_1fr_auto] gap-x-2 md:gap-x-4 items-center py-3 px-2 rounded-lg transition-colors hover:bg-gray-50",
          isUserPrefecture &&
            "bg-emerald-50 border border-emerald-200 hover:bg-emerald-100",
        )}
      >
        {/* 順位 */}
        <div className="flex items-center justify-center w-8">
          {getRankIcon(ranking.rank)}
        </div>

        {/* 都道府県名 */}
        <div
          className={cn(
            "font-medium truncate",
            isUserPrefecture && "text-emerald-700 font-bold",
          )}
        >
          {ranking.prefecture}
        </div>

        {/* チームパワー */}
        <div className="text-right">
          <div className="font-bold text-base md:text-lg whitespace-nowrap">
            {Math.floor(ranking.xpPerCapita).toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 whitespace-nowrap">
            {ranking.totalXp.toLocaleString()} pt /{" "}
            {getPopulationInTenThousand(ranking.prefecture)}万人
          </div>
        </div>
      </div>
    </Link>
  );
}
