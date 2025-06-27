import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import type { Tables } from "@/lib/types/supabase";
import clsx from "clsx";
import { UsersRound } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { MissionIcon } from "../ui/mission-icon";
import MissionAchievementStatus from "./mission-achievement-status";

interface MissionProps {
  mission: Omit<Tables<"missions">, "slug">;
  achieved: boolean;
  achievementsCount?: number;
  userAchievementCount?: number;
  postingCount?: number;
}

export default function Mission({
  mission,
  achieved,
  achievementsCount,
  userAchievementCount = 0,
  postingCount,
}: MissionProps) {
  // 最大達成回数が設定されている場合、ユーザーの達成回数が最大に達しているかどうかを確認
  const hasReachedMaxAchievements =
    mission.max_achievement_count !== null &&
    userAchievementCount >= (mission.max_achievement_count || 0);

  const iconUrl = mission.icon_url ?? "/img/mission_fallback.svg";

  // 日付の整形
  const eventDate = mission.event_date ? new Date(mission.event_date) : null;
  const dateStr = eventDate
    ? `${eventDate.getMonth() + 1}月${eventDate.getDate()}日（${["日", "月", "火", "水", "木", "金", "土"][eventDate.getDay()]}）開催`
    : null;

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center justify-center">
            <div
              className={clsx(
                "w-20 h-20 rounded-full p-[3px]",
                hasReachedMaxAchievements
                  ? "bg-gradient-to-r from-[#64D8C6] to-[#BCECD3]"
                  : "border-4 border-muted-foreground/25",
              )}
            >
              <div className="flex items-center justify-center w-full h-full rounded-full bg-white">
                <MissionIcon src={iconUrl} alt={mission.title} size="md" />
              </div>
            </div>
            <MissionAchievementStatus
              hasReachedMaxAchievements={hasReachedMaxAchievements}
              userAchievementCount={userAchievementCount}
              maxAchievementCount={mission.max_achievement_count}
            />
          </div>
          <div className="flex-1">
            <CardTitle
              className={clsx(
                "text-lg leading-tight mb-2",
                hasReachedMaxAchievements ? "text-gray-600" : "text-gray-900",
              )}
            >
              {mission.title}
            </CardTitle>
            {dateStr && (
              <div
                className={clsx(
                  "text-sm font-medium",
                  hasReachedMaxAchievements ? "text-gray-500" : "text-gray-600",
                )}
              >
                {dateStr}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardFooter className="flex flex-col items-stretch gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-between">
            <UsersRound className="size-4 mr-2" />
            <span
              className={clsx(
                "text-sm font-medium",
                hasReachedMaxAchievements ? "text-gray-500" : "text-gray-700",
              )}
            >
              {mission.required_artifact_type === "POSTING" &&
              postingCount !== undefined
                ? `みんなで${postingCount.toLocaleString()}枚達成`
                : achievementsCount !== undefined
                  ? `みんなで${achievementsCount.toLocaleString()}回達成`
                  : "みんなで0回達成"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <DifficultyBadge
              difficulty={mission.difficulty}
              className={clsx(hasReachedMaxAchievements && "opacity-60")}
            />
          </div>
        </div>
        <Link href={`/missions/${mission.id}`} className="block">
          <Button
            variant="default"
            className={clsx(
              "w-full rounded-full py-6 text-base font-bold text-white shadow-md hover:shadow-lg",
              hasReachedMaxAchievements
                ? "bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600"
                : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700",
            )}
          >
            {hasReachedMaxAchievements ? "達成内容を見る →" : "詳細を見る →"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
