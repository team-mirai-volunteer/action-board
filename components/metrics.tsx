import { MetricCard } from "@/components/metric-card";
import { createClient } from "@/lib/supabase/server";

export default async function Metrics() {
  const supabase = await createClient();

  // count achievements
  const { count: achievementCount } = await supabase
    .from("achievements")
    .select("*", { count: "exact", head: true });

  // 24 hours ago
  const date = new Date();
  date.setHours(date.getHours() - 24);

  const { count: todayAchievementCount } = await supabase
    .from("achievements")
    .select("*", { count: "exact", head: true })
    .gte("created_at", date.toISOString());

  // count total registrations
  const { count: totalRegistrationCount } = await supabase
    .from("public_user_profiles")
    .select("*", { count: "exact", head: true });

  // count today's registrations
  const { count: todayRegistrationCount } = await supabase
    .from("public_user_profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", date.toISOString());

  // count total supporters (users who created mission artifacts)
  const { data: supporterData } = await supabase
    .from("mission_artifacts")
    .select("user_id");

  const totalSupporterCount = supporterData
    ? new Set(supporterData.map((item: { user_id: string }) => item.user_id))
        .size
    : 0;

  // count today's new supporters
  const { data: todaySupporterData } = await supabase
    .from("mission_artifacts")
    .select("user_id")
    .gte("created_at", date.toISOString());

  const todaySupporterCount = todaySupporterData
    ? new Set(
        todaySupporterData.map((item: { user_id: string }) => item.user_id),
      ).size
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-2xl md:text-4xl text-gray-900 mb-2">
            📊 チームみらいの活動状況
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="みんなで達成したアクション数"
            value={achievementCount}
            unit="件"
            todayValue={todayAchievementCount}
            todayUnit="件"
          />
          <MetricCard
            title="アクションボード参加者"
            value={totalRegistrationCount}
            unit="人"
            todayValue={todayRegistrationCount}
            todayUnit="人"
          />
          <MetricCard
            title="参加サポーター"
            value={totalSupporterCount}
            unit="人"
            todayValue={todaySupporterCount}
            todayUnit="人"
          />
        </div>
      </div>
    </div>
  );
}
