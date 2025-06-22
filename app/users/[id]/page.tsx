import Levels from "@/components/levels";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SocialBadge } from "@/components/ui/social-badge";
import { UserMissionAchievements } from "@/components/user-mission-achievements";
import { getUserRepeatableMissionAchievements } from "@/lib/services/userMissionAchievement";
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

  // 並列でデータを取得
  const [{ data: timeline }, { count }, missionAchievements] =
    await Promise.all([
      supabase
        .from("activity_timeline_view")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE),
      supabase
        .from("activity_timeline_view")
        .select("*", { count: "exact" })
        .eq("user_id", id),
      getUserRepeatableMissionAchievements(id),
    ]);

  return (
    <div className="flex flex-col items-stretch max-w-xl gap-4 py-8">
      <Levels userId={user.id} hideProgress />
      <div className="flex justify-center gap-2">
        {user.x_username && (
          <SocialBadge
            username={user.x_username}
            platform="x"
            href={`https://x.com/${user.x_username}`}
            logoSrc="/img/x_logo.png"
            logoAlt="Xのロゴ"
            logoSize={{ width: 16, height: 16 }}
            showAtSymbol={true}
          />
        )}
        {user.github_username && (
          <SocialBadge
            username={user.github_username}
            platform="github"
            href={`https://github.com/${user.github_username}`}
            logoSrc="/img/github-logo.png"
            logoAlt="GitHubのロゴ"
            logoSize={{ width: 20, height: 20 }}
          />
        )}
      </div>
      {(count || 0) > 0 && (
        <Card className="w-full p-4 mt-4">
          <UserMissionAchievements
            achievements={missionAchievements}
            totalCount={count || 0}
          />
        </Card>
      )}
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
