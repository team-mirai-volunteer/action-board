"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import { UsersRound } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MissionIcon } from "@/features/missions/components/mission-icon";
import { calculateMissionXp } from "@/features/user-level/utils/level-calculator";
import {
  POSTER_POINTS_PER_UNIT,
  POSTING_POINTS_PER_UNIT,
} from "@/lib/constants/mission-config";
import type { Tables } from "@/lib/types/supabase";
import MissionAchievementStatus from "./mission-achievement-status";

interface MissionProps {
  mission: Tables<"missions">;
  achievementsCount: number;
  userAchievementCount: number;
}

export default function Mission({
  mission,
  achievementsCount,
  userAchievementCount,
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
    <article>
      <Card className="@container/card">
        <CardHeader className="relative">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full p-[3px]">
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
              <CardTitle className="text-lg leading-tight mb-2 text-gray-900">
                {mission.title}
              </CardTitle>
              {dateStr && (
                <div className="text-sm font-medium text-gray-600">
                  {dateStr}
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardFooter className="flex flex-col items-stretch gap-6">
          <div className="flex flex-col items-start gap-1.5">
            <div className="flex items-center">
              <UsersRound className="size-4 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                みんなで{achievementsCount.toLocaleString()}
                {mission.required_artifact_type === "POSTING" ? "枚" : "回"}達成
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge>
                <span className="text-sm font-medium text-gray-700">
                  難易度
                </span>
                <span className="ml-1">{"⭐".repeat(mission.difficulty)}</span>
              </Badge>
              <Badge
                className={`${mission.is_featured ? "bg-yellow-300/90 text-black" : ""}`}
              >
                <span className="text-sm font-medium text-gray-700">
                  {mission.required_artifact_type === "POSTER"
                    ? `1枚あたり${POSTER_POINTS_PER_UNIT}`
                    : mission.required_artifact_type === "POSTING"
                      ? `1枚あたり${POSTING_POINTS_PER_UNIT}`
                      : calculateMissionXp(mission.difficulty)}
                  <span className="">P</span>
                  {mission.is_featured && <span className="ml-1">x 2</span>}
                </span>
              </Badge>
            </div>
          </div>
          <Link
            href={`/missions/${mission.slug || mission.id}`}
            className="block"
          >
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="default"
                className={clsx(
                  "w-full rounded-full py-6 text-base font-bold text-white border-none",
                  hasReachedMaxAchievements
                    ? "bg-yellow-300 hover:bg-yellow-300/90 text-black"
                    : userAchievementCount === 0
                      ? "bg-primary hover:bg-primary/90"
                      : "bg-yellow-300 hover:bg-yellow-300/90 text-black",
                )}
              >
                {hasReachedMaxAchievements
                  ? "ミッションクリア🎉"
                  : userAchievementCount === 0
                    ? "今すぐチャレンジ🔥"
                    : "もう一回チャレンジ🔥"}
              </Button>
            </motion.div>
          </Link>
        </CardFooter>
      </Card>
    </article>
  );
}
