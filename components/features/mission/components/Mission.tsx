"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Tables } from "@/lib/types/supabase";
import { Calendar, Star, Users } from "lucide-react";
import Link from "next/link";
import React from "react";
import { MissionAchievementStatus } from "./MissionAchievementStatus";

type MissionProps = {
  mission: Tables<"missions">;
  userAchievementCount?: number;
  totalAchievementCount?: number;
  className?: string;
};

export default function Mission({
  mission,
  userAchievementCount = 0,
  totalAchievementCount = 0,
  className = "",
}: MissionProps) {
  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return "bg-green-100 text-green-800";
      case 2:
        return "bg-blue-100 text-blue-800";
      case 3:
        return "bg-yellow-100 text-yellow-800";
      case 4:
        return "bg-orange-100 text-orange-800";
      case 5:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyStars = (difficulty: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={`star-${i < difficulty ? "filled" : "empty"}-${i}`}
        className={`h-3 w-3 ${
          i < difficulty ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const maxAchievements = mission.max_achievement_count;
  const hasReachedMaxAchievements =
    maxAchievements !== null && userAchievementCount >= maxAchievements;
  const canRepeat = maxAchievements === null || maxAchievements > 1;

  const getButtonText = () => {
    if (hasReachedMaxAchievements) {
      return "ミッションクリア🎉";
    }
    if (userAchievementCount > 0 && canRepeat) {
      return "もう一回チャレンジ🔥";
    }
    return "今すぐチャレンジ🔥";
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ["日", "月", "火", "水", "木", "金", "土"][date.getDay()];
    return `${month}月${day}日（${dayOfWeek}）開催`;
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {mission.icon_url ? (
            <img
              src={mission.icon_url}
              alt={mission.title}
              className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
            />
          ) : (
            <img
              src="/mission_fallback.svg"
              alt={mission.title}
              className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-2">
              {mission.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getDifficultyColor(mission.difficulty)}>
                難易度 {mission.difficulty}
              </Badge>
              <div className="flex items-center gap-1">
                {getDifficultyStars(mission.difficulty)}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {mission.event_date && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatEventDate(mission.event_date)}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>みんなで{totalAchievementCount}回達成</span>
        </div>

        <MissionAchievementStatus
          mission={mission}
          userAchievementCount={userAchievementCount}
        />
      </CardContent>

      <CardFooter className="pt-0">
        <Link href={`/missions/${mission.id}`} className="w-full">
          <Button
            className="w-full"
            variant={hasReachedMaxAchievements ? "secondary" : "default"}
            disabled={hasReachedMaxAchievements}
          >
            {getButtonText()}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
