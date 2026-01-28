import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import type { MissionActionRanking } from "../types";

interface MissionRankingListProps {
  rankings: MissionActionRanking[];
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

export function MissionRankingList({ rankings }: MissionRankingListProps) {
  if (rankings.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="text-sm font-medium mb-4">ミッション別ランキング</h3>
        <div className="text-center text-gray-400 text-sm py-8">
          データがありません
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="text-sm font-medium mb-4">ミッション別ランキング</h3>
      <div className="space-y-3">
        {rankings.map((mission, index) => (
          <Link
            key={mission.missionId}
            href={`/missions/${mission.missionSlug}`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-lg font-bold text-gray-400 w-8 text-center">
              {index + 1}
            </span>
            {mission.iconUrl ? (
              <Image
                src={mission.iconUrl}
                alt=""
                width={32}
                height={32}
                className="rounded"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-400 text-xs">-</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {mission.missionTitle}
              </div>
            </div>
            <div className="text-sm font-bold text-gray-700">
              {formatNumber(mission.actionCount)}
              <span className="text-xs font-normal text-gray-500 ml-1">件</span>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
