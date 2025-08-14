import { ActivityTimeline } from "@/components/activity-timeline";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function Activities() {
  const supabase = await createClient();

  const { data: activityTimelines } = await supabase
    .from("activity_timeline_view")
    .select()
    .order("created_at", { ascending: false })
    .limit(10);

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
                timeline={activityTimelines ?? []}
                hasNext={false}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
