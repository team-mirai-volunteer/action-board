import { ChevronUp, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getPopulationInTenThousand } from "@/lib/constants/prefecture-populations";
import type { PrefectureTeamRanking } from "../types/prefecture-team-types";

interface PrefectureTeamGoalBannerProps {
  currentPrefectureRanking: PrefectureTeamRanking;
  rankings: PrefectureTeamRanking[];
}

export function PrefectureTeamGoalBanner({
  currentPrefectureRanking,
  rankings,
}: PrefectureTeamGoalBannerProps) {
  // 1位の場合
  if (currentPrefectureRanking.rank === 1) {
    return (
      <Card className="bg-emerald-50 border-teal-200 p-4">
        <div className="flex items-center gap-2 text-emerald-600">
          <Target className="w-5 h-5" />
          <span className="font-bold">
            現在1位！この調子でトップを維持しよう！
          </span>
        </div>
      </Card>
    );
  }

  // 一つ上の順位の県を取得
  const targetPrefecture = rankings.find(
    (r) => r.rank === currentPrefectureRanking.rank - 1,
  );

  if (!targetPrefecture) {
    return null;
  }

  // 追い越すために必要なXP差を計算
  const xpPerCapitaGap =
    targetPrefecture.xpPerCapita - currentPrefectureRanking.xpPerCapita;
  const populationInTenThousand = getPopulationInTenThousand(
    currentPrefectureRanking.prefecture,
  );
  const estimatedXpNeeded = Math.ceil(xpPerCapitaGap * populationInTenThousand);

  return (
    <Card className="bg-emerald-50 border-emerald-200 p-4">
      <div className="flex items-center gap-3">
        <div className="bg-emerald-100 rounded-full p-2">
          <ChevronUp className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <div className="text-sm text-teal-600">
            あと約{" "}
            <span className="font-bold">
              {estimatedXpNeeded.toLocaleString()} pt
            </span>{" "}
            で{currentPrefectureRanking.rank - 1}位に浮上できます
          </div>
        </div>
      </div>
    </Card>
  );
}
