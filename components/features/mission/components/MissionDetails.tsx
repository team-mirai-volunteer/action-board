"use client";

import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/lib/types/supabase";
import { Calendar, Star } from "lucide-react";
import React from "react";
import { YouTubeSubscribeButton } from "./YouTubeSubscribeButton";

type MissionDetailsProps = {
  mission: Tables<"missions">;
  mainLink?: Tables<"mission_main_links"> | null;
};

export function MissionDetails({ mission, mainLink }: MissionDetailsProps) {
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
        className={`h-4 w-4 ${
          i < difficulty ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        {mission.icon_url && (
          <div className="flex justify-center">
            <img
              src={mission.icon_url}
              alt={mission.title}
              className="w-16 h-16 object-cover rounded-lg"
            />
          </div>
        )}

        <h1 className="text-2xl font-bold">{mission.title}</h1>

        <div className="flex justify-center items-center gap-4">
          <Badge className={getDifficultyColor(mission.difficulty)}>
            難易度 {mission.difficulty}
          </Badge>
          <div className="flex items-center gap-1">
            {getDifficultyStars(mission.difficulty)}
          </div>
        </div>

        {mission.event_date && (
          <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              イベント日:{" "}
              {new Date(mission.event_date).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        )}
      </div>

      <div className="prose prose-sm max-w-none mission-content">
        {mission.content || ""}
      </div>

      {mission.id === "youtube-mission-id" && (
        <div className="flex justify-center">
          <YouTubeSubscribeButton channelId="test-channel-id" />
        </div>
      )}

      {mainLink && (
        <div className="flex justify-center mt-4">
          <a
            href={mainLink.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {mainLink.label || "詳細を見る"}
          </a>
        </div>
      )}
    </div>
  );
}
