import Levels from "@/components/levels";
import { Card } from "@/components/ui/card";
import { UserMissionAchievements } from "@/components/user-mission-achievements";
import { getUserMissionAchievements } from "@/lib/services/userMissionAchievement";
import { createClient } from "@/lib/supabase/server";
import UserDetailActivities from "./user-detail-activities";

const PAGE_SIZE = 20;

type Params = {
  id: string;
};

type Props = {
  params: Promise<Params>;
};

export default async function UserDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // ユーザー情報取得
  const { data: user } = await supabase
    .from("public_user_profiles")
    .select("*")
    .eq("id", id)
    .single();
  if (!user) return <div>ユーザーが見つかりません</div>;

  // 活動タイムライン取得
  const { data: timeline } = await supabase
    .from("activity_timeline_view")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  const { count } = await supabase
    .from("activity_timeline_view")
    .select("*", { count: "exact" })
    .eq("user_id", id);

  // ミッション達成状況取得
  const missionAchievements = await getUserMissionAchievements(id);

  return (
    <div className="flex flex-col items-stretch max-w-xl gap-4 py-8">
      <Levels userId={user.id} hideProgress />
      <div className="flex flex-col items-center">
        {user.x_username && (
          <div className="flex items-center gap-2 mt-2" style={{ height: 20 }}>
            <img
              src="/img/x_logo.png"
              alt="Xのロゴ"
              style={{
                width: 16,
                height: 16,
                display: "block",
              }}
            />
            <a
              href={`https://x.com/${user.x_username}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontWeight: 500,
                fontFamily:
                  "Chirp, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                fontSize: "18px",
                lineHeight: "20px",
                height: 20,
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
              }}
              className="text-[#0F1419] hover:text-blue-600 hover:underline"
            >
              @{user.x_username}
            </a>
          </div>
        )}
      </div>
      <Card className="w-full p-4 mt-4">
        <UserMissionAchievements achievements={missionAchievements} />
      </Card>
      <Card className="w-full p-4 mt-4">
        <div className="flex flex-row justify-between items-center mb-2">
          <span className="text-lg font-bold">活動タイムライン</span>
        </div>
        <UserDetailActivities
          userId={id}
          initialTimeline={timeline || []}
          pageSize={PAGE_SIZE}
          totalCount={count || 0}
        />
      </Card>
    </div>
  );
}
