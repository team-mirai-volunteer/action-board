import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ActivityTimeline } from "@/features/user-activity/components/activity-timeline";
import { getGlobalActivityTimeline } from "@/features/user-activity/services/timeline";

export default async function Activities() {
  const timeline = await getGlobalActivityTimeline(3);

  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="flex flex-col gap-6 items-center">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl text-gray-900 mb-2">
            ⏰ 活動タイムライン
          </h2>
          <p className="text-sm text-gray-600">
            リアルタイムで更新される活動記録
          </p>
        </div>
        <Card className="max-w-lg rounded-xl shadow-sm transition-all duration-300 p-8 bg-white">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <ActivityTimeline timeline={timeline} hasNext={false} />
            </div>
          </div>
        </Card>
        <div className="flex justify-center">
          <Link
            href="/activities"
            className="flex items-center text-teal-600 hover:text-teal-700"
          >
            もっと見る
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
