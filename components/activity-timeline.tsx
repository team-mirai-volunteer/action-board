import { dateTimeFormatter } from "@/lib/formatter";
import type { ActivityTimelineItem } from "@/lib/services/activityTimeline";
import type { Tables } from "@/lib/types/supabase";
import Link from "next/link";
import { Button } from "./ui/button";
import UserAvatar from "./user-avatar";

interface ActivityTimelineProps {
  timeline: Tables<"activity_timeline_view">[] | ActivityTimelineItem[];
  hasNext: boolean;
  onLoadMore?: () => void;
}

export function ActivityTimeline({
  timeline,
  hasNext,
  onLoadMore,
}: ActivityTimelineProps) {
  return (
    <div className="flex flex-col gap-4">
      {timeline.length === 0 && <div>活動履歴がありません</div>}
      {timeline.map((activity, idx) => (
        <div
          key={activity.id || idx}
          className="flex flex-row gap-2 items-center"
        >
          <Link href={`/users/${activity.user_id}`}>
            <UserAvatar
              className="w-10 h-10"
              userProfile={{
                name: activity.name,
                avatar_url: activity.avatar_url,
              }}
            />
          </Link>
          <div>
            <div className="text-sm">
              {activity.activity_type === "signup"
                ? activity.title
                : `${activity.address_prefecture}の${activity.name}さんが「${activity.title}」を達成しました！`}
            </div>
            <div className="text-xs text-gray-500">
              {activity.created_at &&
                dateTimeFormatter(new Date(activity.created_at))}
            </div>
          </div>
        </div>
      ))}
      {hasNext && (
        <Button variant="outline" onClick={onLoadMore}>
          もっと見る
        </Button>
      )}
    </div>
  );
}
