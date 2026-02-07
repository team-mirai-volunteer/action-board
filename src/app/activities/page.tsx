import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import GlobalActivities from "@/features/user-activity/components/global-activities";
import {
  getGlobalActivityTimeline,
  getGlobalActivityTimelineCount,
} from "@/features/user-activity/loaders/timeline-loaders";

export const metadata: Metadata = {
  title: "活動タイムライン | アクションボード",
  description: "リアルタイムで更新される活動記録",
};

const PAGE_SIZE = 50;

export default async function ActivitiesPage() {
  const [timeline, totalCount] = await Promise.all([
    getGlobalActivityTimeline(PAGE_SIZE),
    getGlobalActivityTimelineCount(),
  ]);

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-2xl md:text-4xl text-gray-900 mb-2">
              ⏰ 活動タイムライン
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              リアルタイムで更新される活動記録
            </p>
          </div>
          <Card className="border-2 border-gray-200 rounded-2xl shadow-lg p-8 bg-white">
            <GlobalActivities
              initialTimeline={timeline}
              totalCount={totalCount}
              pageSize={PAGE_SIZE}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
