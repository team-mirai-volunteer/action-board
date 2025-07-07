import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";

interface SupporterData {
  totalCount: number;
  last24hCount: number;
  updatedAt: string;
}

interface DonationData {
  totalAmount: number;
  last24hAmount: number;
  totalCount: number;
  last24hCount: number;
  updatedAt: string;
}

async function fetchSupporterData(): Promise<SupporterData | null> {
  try {
    const response = await fetch(
      "https://gist.github.com/nishio/58bc7d92b15dfdfa4c7ec4bf823a70d5/raw/latest_supporter_data.json",
    );
    if (!response.ok) {
      console.error("Failed to fetch supporter data:", response.status);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching supporter data:", error);
    return null;
  }
}

async function fetchDonationData(): Promise<DonationData | null> {
  try {
    const response = await fetch(
      "https://gist.githubusercontent.com/nishio/f45275a47e42bbb76f7efef750bed37a/raw/latest_stripe_data.json",
    );
    if (!response.ok) {
      console.error("Failed to fetch donation data:", response.status);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching donation data:", error);
    return null;
  }
}

export default async function Metrics() {
  const supabase = await createClient();

  const [supporterData, donationData] = await Promise.all([
    fetchSupporterData(),
    fetchDonationData(),
  ]);

  const supporterCount = supporterData?.totalCount ?? 75982;
  const supporterIncrease = supporterData?.last24hCount ?? 1710;
  const donationAmount = donationData ? donationData.totalAmount / 10000 : null;
  const donationIncrease = donationData
    ? donationData.last24hAmount / 10000
    : null;

  const formatAmount = (amount: number) => {
    const oku = Math.floor(amount / 10000);
    const man = amount % 10000;

    if (oku === 0) {
      const formatted = man.toFixed(1);
      return formatted.endsWith(".0") ? formatted.slice(0, -2) : formatted;
    }
    if (man === 0) {
      return `${oku}億`;
    }
    const manFormatted = man.toFixed(1);
    const manDisplay = manFormatted.endsWith(".0")
      ? manFormatted.slice(0, -2)
      : manFormatted;
    return `${oku}億${manDisplay}`;
  };

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
    <section className="bg-gradient-hero flex justify-center py-6 px-4">
      <div className="w-full max-w-xl bg-white rounded-md shadow-custom p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-black mb-1">
            チームみらいの活動状況🚀
          </h2>
          <p className="text-xs text-black">2025.07.03 02:20 更新</p>
        </div>

        <div className="mb-6">
          <div
            className="p-4 text-center"
            style={{ backgroundColor: "#F9F9F9" }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <p className="text-xs font-bold text-black">
                チームみらい　サポーター数
              </p>
            </div>
            <p className="text-3xl font-bold text-teal-700 mb-1">
              {supporterCount.toLocaleString()}
              <span className="text-xl">人</span>
            </p>
            <p className="text-sm text-black">
              1日で{" "}
              <span className="font-bold text-teal-700">
                +{supporterIncrease.toLocaleString()}
                <span className="text-xs">人増えました！</span>
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-stretch">
          <div className="flex-1 text-center flex flex-col justify-center">
            <p className="text-xs font-bold text-black mb-2">
              達成したアクション数
            </p>
            <p className="text-2xl font-black text-black mb-1">
              18,605<span className="text-lg">件</span>
            </p>
            <p className="text-xs text-black">
              1日で{" "}
              <span className="font-bold text-teal-700">
                +245<span className="text-xs">件</span>
              </span>
            </p>
          </div>
          <Separator orientation="vertical" className="mx-4 h-full" />
          <div className="flex-1 text-center flex flex-col justify-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <p className="text-xs font-bold text-black">現在の寄付金額</p>
              <div className="group relative">
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-label="寄付金額の詳細情報"
                  >
                    <title>寄付金額の詳細情報</title>
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap z-10">
                  政治団体「チームみらい」への寄付と、
                  <br />
                  安野及び各公認候補予定者の政治団体への寄付の合計金額
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                </div>
              </div>
            </div>
            <p className="text-2xl font-black text-black mb-1">
              {donationAmount !== null ? formatAmount(donationAmount) : "-"}
              <span className="text-lg">万円</span>
            </p>
            <p className="text-xs text-black">
              1日で{" "}
              <span className="font-bold text-teal-700">
                +
                {donationIncrease !== null
                  ? formatAmount(donationIncrease)
                  : "-"}
                <span className="text-xs">万円</span>
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
