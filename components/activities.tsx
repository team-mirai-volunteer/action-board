"use client";

import { ActivityTimeline } from "@/components/activity-timeline";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/types/supabase";
import { useState } from "react";

interface ActivitiesProps {
  initialTimeline: Tables<"activity_timeline_view">[];
  totalCount: number;
  pageSize: number;
}

export default function Activities(props: ActivitiesProps) {
  const supabase = createClient();
  const [timeline, setTimeline] = useState<Tables<"activity_timeline_view">[]>(
    props.initialTimeline,
  );
  const [hasNext, setHasNext] = useState(
    props.totalCount > props.initialTimeline.length,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoadMore = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data: takeTimeline, error: fetchError } = await supabase
        .from("activity_timeline_view")
        .select("*")
        .order("created_at", { ascending: false })
        .range(timeline.length, timeline.length + props.pageSize - 1);

      if (fetchError) {
        throw fetchError;
      }

      if (takeTimeline) {
        const newTimeline = [...timeline, ...takeTimeline];
        setTimeline(newTimeline);
        setHasNext(newTimeline.length < props.totalCount);
      }
    } catch (err) {
      console.error("Failed to load more activities:", err);
      setError("活動データの読み込みに失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-2xl md:text-4xl text-gray-900 mb-2">
            ⏰ 活動タイムライン
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            リアルタイムで更新される活動記録
          </p>
        </div>
        <Card className="border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 bg-white">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <ActivityTimeline
                timeline={timeline || []}
                hasNext={hasNext}
                onLoadMore={handleLoadMore}
              />
              {isLoading && (
                <div className="text-center text-gray-500 py-4">
                  読み込み中...
                </div>
              )}
              {error && (
                <div className="text-center text-red-500 py-4">{error}</div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
