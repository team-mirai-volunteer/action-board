"use client";

import { ActivityTimeline } from "@/components/activity-timeline";
import { getUserActivityTimeline } from "@/lib/services/activityTimeline";
import type { ActivityTimelineItem } from "@/lib/services/activityTimeline";
import { createClient } from "@/lib/supabase/client";
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
      const newTimeline = await getUserActivityTimeline(
        props.userId,
        props.pageSize,
        timeline.length, // offset
      );

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
