import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { UserSeasonHistoryProps } from "@/features/user-season/types/season-types";
import Link from "next/link";

export function UserSeasonHistory({
  userId,
  seasonHistory,
}: UserSeasonHistoryProps) {
  if (seasonHistory.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        シーズン履歴がありません
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {seasonHistory.map(({ season, userLevel }) => (
        <Link
          key={season.id}
          href={
            season.is_active
              ? `/users/${userId}`
              : `/seasons/${season.slug}/users/${userId}`
          }
          className="block"
        >
          <Card className="p-4 hover:bg-emerald-50/50 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold hover:text-teal-600 transition-colors">
                    {season.name}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(season.start_date).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  〜{" "}
                  {season.end_date
                    ? new Date(season.end_date).toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "進行中"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-600">
                  Lv.{userLevel?.level || 1}
                </div>
                <div className="text-sm text-gray-500">
                  {userLevel?.xp?.toLocaleString() || 0} ポイント
                </div>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
