import { Card } from "@/components/ui/card";
import Link from "next/link";

interface MissionAchievementCardProps {
  missionId: string;
  title: string;
  count: number;
}

export function MissionAchievementCard({
  missionId,
  title,
  count,
}: MissionAchievementCardProps) {
  return (
    <Link href={`/missions/${missionId}`}>
      <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center">
          <div className="text-sm font-bold text-gray-700 flex-1 min-w-0 truncate">
            {title}
          </div>
          <div className="flex items-baseline gap-2 ml-4">
            <span className="text-2xl font-bold text-teal-600">{count}</span>
            <span className="text-base font-bold text-gray-700">回</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
