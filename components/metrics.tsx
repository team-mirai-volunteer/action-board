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

  const supporterCount = 8512;
  const donationAmount = 83011000;
  const dailyDonationIncrease = 123500;
  const achievementGoal = 100000;
  const participantGoal = 15000;

  const now = new Date();
  const formattedDate = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} 更新`;

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex justify-center">
        <div className="w-full max-w-md bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg shadow-lg p-6 border border-emerald-200">
          {/* Header */}
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 mb-1">
              チームみらいの活動状況
            </h2>
            <p className="text-sm text-gray-600">{formattedDate}</p>
          </div>

          {/* Main Supporter Count */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-700 mb-1">
              チームみらい参加サポーター数
            </p>
            <p className="text-4xl font-bold text-emerald-600">
              {supporterCount.toLocaleString()}
              <span className="text-lg text-gray-700 ml-1">人</span>
            </p>
          </div>

          {/* Sub Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">達成したアクション数</p>
              <p className="text-xl font-bold text-gray-800">
                {(achievementCount || 60762).toLocaleString()}
                <span className="text-sm text-gray-600 ml-1">件</span>
              </p>
              <p className="text-xs text-gray-500">
                目標 {achievementGoal.toLocaleString()}件
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">
                アクションボード参加者数
              </p>
              <p className="text-xl font-bold text-gray-800">
                {(totalRegistrationCount || 6141).toLocaleString()}
                <span className="text-sm text-gray-600 ml-1">人</span>
              </p>
              <p className="text-xs text-gray-500">
                目標 {participantGoal.toLocaleString()}人
              </p>
            </div>
          </div>

          {/* Donation Section */}
          <div className="border-t border-emerald-200 pt-4">
            <div className="text-center">
              <p className="text-sm text-gray-700 mb-1">現在の寄付金額</p>
              <p className="text-2xl font-bold text-gray-800 mb-2">
                {donationAmount.toLocaleString()}
                <span className="text-sm text-gray-600 ml-1">円</span>
              </p>
              <p className="text-sm text-emerald-600 font-semibold">
                前日増加分 +{dailyDonationIncrease.toLocaleString()}円
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
