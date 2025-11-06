import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { UserSeasonHeaderProps } from "@/features/user-season/types/season-types";
import { localeDateFormatter } from "@/lib/utils/date-formatters";

export function UserSeasonHeader({ season, userId }: UserSeasonHeaderProps) {
  return (
    <Card className="w-full p-4 bg-emerald-50/80 border-emerald-200">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-bold text-gray-900">{season.name}</h2>
            {season.is_active && (
              <Badge
                variant="default"
                className="text-xs bg-teal-600 hover:bg-teal-700"
              >
                現在のシーズン
              </Badge>
            )}
            {!season.is_active && (
              <Badge variant="secondary" className="text-xs">
                終了
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600">
            {localeDateFormatter(season.start_date)} {" 〜 "}
            {season.end_date ? localeDateFormatter(season.end_date) : "進行中"}
          </p>
        </div>
      </div>
    </Card>
  );
}
