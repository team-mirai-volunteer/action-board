import { YouTubeSubscribeButton } from "@/app/missions/[id]/_components/YouTubeSubscribeButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import { MissionIcon } from "@/components/ui/mission-icon";
import { YOUTUBE_MISSION_CONFIG } from "@/lib/constants";
import { dateFormatter } from "@/lib/formatter";
import type { Tables } from "@/lib/types/supabase";

type MissionDetailsProps = {
  mission: Tables<"missions">;
};

export function MissionDetails({ mission }: MissionDetailsProps) {
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
          // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
          dangerouslySetInnerHTML={{ __html: mission.content || "" }}
        />

        {/* YouTubeチャンネル登録ミッションの場合のみ、YouTube登録ボタンを表示 */}
        {mission.id === YOUTUBE_MISSION_CONFIG.MISSION_ID && (
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
