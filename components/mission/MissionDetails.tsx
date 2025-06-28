"use client";

import { MainLinkButton } from "@/app/missions/[id]/_components/MainLinkButton";
import { YouTubeSubscribeButton } from "@/app/missions/[id]/_components/YouTubeSubscribeButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import { MissionIcon } from "@/components/ui/mission-icon";
import { ARTIFACT_TYPES } from "@/lib/artifactTypes";
import { YOUTUBE_MISSION_CONFIG } from "@/lib/constants";
import { dateFormatter } from "@/lib/formatter";
import type { Tables } from "@/lib/types/supabase";

type MissionDetailsProps = {
  mission: Tables<"missions">;
  mainLink?: Tables<"mission_main_links"> | null;
  onMainLinkClick?: () => Promise<{ success: boolean; error?: string }>;
  isCompleted?: boolean;
};

export function MissionDetails({
  mission,
  mainLink,
  onMainLinkClick,
  isCompleted = false,
}: MissionDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-4">
          {mission.icon_url && (
            <MissionIcon src={mission.icon_url} alt={mission.title} size="lg" />
          )}
          <div className="flex-1 space-y-2">
            <CardTitle className="text-xl">{mission.title}</CardTitle>
            <div className="flex flex-wrap gap-2">
              <DifficultyBadge difficulty={mission.difficulty} />
              {mission.event_date && (
                <Badge variant="outline">
                  {dateFormatter(new Date(mission.event_date))}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className="text-muted-foreground leading-relaxed whitespace-pre-wrap mission-content"
          ref={(el) => {
            if (el && mission.content) {
              el.innerHTML = mission.content;
            }
          }}
        />

        {/* YouTubeチャンネル登録ミッションの場合のみ、YouTube登録ボタンを表示 */}
        {mission.id === YOUTUBE_MISSION_CONFIG.MISSION_ID && (
          <div className="flex justify-center mt-6">
            <YouTubeSubscribeButton
              channelId={YOUTUBE_MISSION_CONFIG.CHANNEL_ID}
            />
          </div>
        )}

        {/* LINK_ACCESSミッションの場合、アクションボタンを表示 */}
        {mission.required_artifact_type === ARTIFACT_TYPES.LINK_ACCESS.key &&
          mainLink && (
            <div className="flex flex-col items-center mt-6 space-y-4">
              <MainLinkButton
                mission={mission}
                mainLink={mainLink}
                onLinkClick={isCompleted ? undefined : onMainLinkClick}
                isDisabled={false}
                size="lg"
                className="w-full"
              />

              {!isCompleted && (
                <div className="text-sm text-muted-foreground text-center">
                  リンクを開くとミッションクリアとなります
                </div>
              )}
            </div>
          )}
      </CardContent>
    </Card>
  );
}
