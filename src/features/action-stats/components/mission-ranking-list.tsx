import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { MissionActionRanking } from "../types";
import { formatNumberJa } from "../utils/format";

interface MissionRankingListProps {
  rankings: MissionActionRanking[];
}

function getRankBadgeStyle(rank: number): string {
  switch (rank) {
    case 1:
      return "bg-yellow-500 text-white";
    case 2:
      return "bg-gray-400 text-white";
    case 3:
      return "bg-amber-600 text-white";
    default:
      return "bg-gray-200 text-gray-600";
  }
}

export function MissionRankingList({ rankings }: MissionRankingListProps) {
  if (rankings.length === 0) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h3 className="text-sm font-medium">ミッション別ランキング</h3>
        </div>
        <div className="text-center text-gray-400 text-sm py-8">
          データがありません
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h3 className="text-sm font-medium">ミッション別ランキング</h3>
      </div>
      <div className="space-y-2">
        {rankings.map((mission, index) => (
          <Link
            key={mission.missionId}
            href={`/missions/${mission.slug}`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getRankBadgeStyle(index + 1)}`}
            >
              {index + 1}
            </div>
            {mission.iconUrl ? (
              <div className="w-8 h-8 relative rounded overflow-hidden flex-shrink-0">
                <Image
                  src={mission.iconUrl}
                  alt={mission.title}
                  fill
                  className="object-cover"
                  sizes="32px"
                />
              </div>
            ) : (
              <div className="w-8 h-8 bg-gray-200 rounded flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {mission.title}
              </div>
            </div>
            <div className="text-sm font-bold text-gray-700">
              {formatNumberJa(mission.achievementCount)}
              <span className="text-xs text-gray-500 ml-1">回</span>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
