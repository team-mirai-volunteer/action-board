import { Card } from "@/components/ui/card";

interface MissionAchievementCardProps {
  title: string;
  count: number;
}

export function MissionAchievementCard({
  title,
  count,
}: MissionAchievementCardProps) {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-center">
        <div className="text-sm font-bold text-gray-700 flex-1">{title}</div>
        <div className="flex items-baseline gap-2 ml-4">
          <span className="text-2xl font-bold text-teal-600">{count}</span>
          <span className="text-base font-bold text-gray-700">回</span>
        </div>
      </div>
    </Card>
  );
}
