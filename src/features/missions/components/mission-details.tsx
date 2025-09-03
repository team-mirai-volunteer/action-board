"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import { MissionIcon } from "@/components/ui/mission-icon";
import { YouTubeSubscribeButton } from "@/features/mission-detail/components/youtube-subscribe-button";
import { YOUTUBE_MISSION_CONFIG } from "@/lib/constants";
import { dateFormatter } from "@/lib/formatter";
import type { Tables } from "@/lib/types/supabase";

type MissionDetailsProps = {
  mission: Tables<"missions">;
  mainLink?: Tables<"mission_main_links"> | null;
  onMainLinkClick?: () => Promise<{ success: boolean; error?: string }>;
};

export function MissionDetails({
  mission,
  mainLink,
  onMainLinkClick,
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
        {mission.slug === YOUTUBE_MISSION_CONFIG.SLUG && (
          <div className="flex justify-center mt-6">
            <YouTubeSubscribeButton
              channelId={YOUTUBE_MISSION_CONFIG.CHANNEL_ID}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
