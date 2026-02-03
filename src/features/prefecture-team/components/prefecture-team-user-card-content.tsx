import { TrendingUp, Trophy } from "lucide-react";
import type {
  PrefectureTeamRanking,
  UserPrefectureContribution,
} from "../types/prefecture-team-types";

function getPrefectureInternalLabel(prefecture: string): string {
  if (prefecture === "東京都") return "都内";
  if (prefecture === "北海道") return "道内";
  if (prefecture.endsWith("府")) return "府内";
  return "県内";
}

function formatContributionPercent(percent: number): string {
  if (percent >= 0.1) return percent.toFixed(1);
  if (percent >= 0.01) return percent.toFixed(2);
  return percent.toFixed(3);
}

interface PrefectureTeamUserCardContentProps {
  prefectureRanking: PrefectureTeamRanking;
  userContribution: UserPrefectureContribution;
}

export function PrefectureTeamUserCardContent({
  prefectureRanking,
  userContribution,
}: PrefectureTeamUserCardContentProps) {
  return (
    <div className="bg-white mt-2">
      {/* 県名と順位 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
            {prefectureRanking.rank}位
          </div>
          <div>
            <div className="font-medium text-lg">
              {prefectureRanking.prefecture}
            </div>
            <div className="text-sm text-gray-500">
              チームパワー{" "}
              {Math.floor(prefectureRanking.xpPerCapita).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* ユーザーの貢献度 */}
      <div className="pt-4 border-t">
        <div className="text-sm text-gray-600 mb-2">あなたの貢献</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold">
              {getPrefectureInternalLabel(prefectureRanking.prefecture)}{" "}
              {userContribution.userRankInPrefecture}位
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-500" />
            <span className="text-sm font-bold">
              貢献度{" "}
              {formatContributionPercent(userContribution.contributionPercent)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
