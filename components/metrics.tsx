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

  return (
    <div className="px-4">
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-2xl md:text-4xl text-gray-900 mb-2">
            📊 チームみらいの活動状況
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MetricCard
            title="アクション数"
            description="みんなで達成した成果"
            value={achievementCount}
            unit="件"
            todayValue={todayAchievementCount}
            todayUnit="件"
          />
          <MetricCard
            title="登録人数"
            description="アクションボード参加者"
            value={totalRegistrationCount}
            unit="人"
            todayValue={todayRegistrationCount}
            todayUnit="人"
          />
        </div>
      </div>
    </div>
  );
}
