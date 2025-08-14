import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Tables } from "@/lib/types/supabase";
import Link from "next/link";

type Season = Tables<"seasons">;

interface SeasonRankingHeaderProps {
  season: Season;
  currentRankingPath?: string;
}

export function SeasonRankingHeader({
  season,
  currentRankingPath = "/ranking",
}: SeasonRankingHeaderProps) {
  return (
    <div className="w-full max-w-6xl mb-4 px-4">
      <Card className=" p-4 bg-emerald-50/80 border-emerald-200">
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
            </p>
          </div>
          {season.is_active && (
            <Link
              href={currentRankingPath}
              className="text-teal-600 hover:text-teal-700 hover:underline text-sm transition-colors"
            >
              現在のランキングを見る →
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
}
