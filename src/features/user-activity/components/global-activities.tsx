"use client";

import { useState } from "react";
import { fetchMoreGlobalActivities } from "@/features/user-activity/actions/timeline-actions";
import { ActivityTimeline } from "@/features/user-activity/components/activity-timeline";
import type { ActivityTimelineItem } from "@/features/user-activity/types/activity-types";

interface GlobalActivitiesProps {
  initialTimeline: ActivityTimelineItem[];
  totalCount: number;
  pageSize: number;
}

export default function GlobalActivities({
  initialTimeline,
  totalCount,
  pageSize,
}: GlobalActivitiesProps) {
  const [timeline, setTimeline] =
    useState<ActivityTimelineItem[]>(initialTimeline);
  const [hasNext, setHasNext] = useState(totalCount > initialTimeline.length);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadMore = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const newTimeline = await fetchMoreGlobalActivities(
        pageSize,
        timeline.length,
      );

      if (newTimeline.length > 0) {
        const updatedTimeline = [...timeline, ...newTimeline];
        setTimeline(updatedTimeline);
        setHasNext(updatedTimeline.length < totalCount);
      } else {
        setHasNext(false);
      }
    } catch (error) {
      console.error("Failed to load more activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <ActivityTimeline
        timeline={timeline}
        hasNext={hasNext && !isLoading}
        onLoadMore={handleLoadMore}
      />
      {isLoading && (
        <div className="text-center text-sm text-gray-500 mt-2">
          読み込み中...
        </div>
      )}
    </div>
  );
}
