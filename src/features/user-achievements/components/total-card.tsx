import { Card } from "@/components/ui/card";

interface MissionAchievementTotalCardProps {
  totalCount: number;
}

export function MissionAchievementTotalCard({
  totalCount,
}: MissionAchievementTotalCardProps) {
  return (
    <Card className="relative overflow-hidden border-2 border-emerald-200 rounded-2xl shadow-sm transition-all duration-300 p-4 bg-gradient-to-br from-white to-emerald-50">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full opacity-20 -mr-16 -mt-16" />
      <div className="relative flex justify-between items-center">
        <div className="flex items-center gap-1">
          <span className="text-gray-700">🏆</span>
          <span className="text-base font-bold text-gray-700">総達成数</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
            {totalCount}
          </span>
          <span className="text-xl font-bold text-gray-700">回</span>
        </div>
      </div>
    </Card>
  );
}
