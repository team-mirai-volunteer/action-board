"use client";

import { ActivityTimeline } from "@/components/activity-timeline";
import type { ActivityTimelineItem } from "@/lib/services/activityTimeline";
import { useState } from "react";

interface UserDetailActivitiesProps {
  initialTimeline: ActivityTimelineItem[];
  totalCount: number;
  pageSize: number;
  userId: string;
}

export default function UserDetailActivities(props: UserDetailActivitiesProps) {
  const [timeline, setTimeline] = useState<ActivityTimelineItem[]>(
    props.initialTimeline,
  );
  const [hasNext, setHasNext] = useState(
    props.totalCount > props.initialTimeline.length,
  );

  const handleLoadMore = async () => {
    try {
      const response = await fetch(
        `/api/users/${props.userId}/activity-timeline?limit=${props.pageSize}&offset=${timeline.length}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch activity timeline");
      }

      const { timeline: newTimeline } = await response.json();

      if (newTimeline.length > 0) {
        const updatedTimeline = [...timeline, ...newTimeline];
        setTimeline(updatedTimeline);
        setHasNext(updatedTimeline.length < props.totalCount);
      }
    } catch (error) {
      console.error("Failed to load more activities:", error);
    }
  };

  return (
    <div>
      <ActivityTimeline
        timeline={timeline || []}
        hasNext={hasNext}
        onLoadMore={handleLoadMore}
      />
    </div>
  );
}
