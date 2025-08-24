/**
 * シーズン別ユーザー詳細ページ
 *
 * 既存のユーザー詳細ページ（/users/[id]）と同じ構造で、
 * 最上部にシーズン情報ヘッダーを追加したページです。
 *
 * 主な機能:
 * - シーズン情報ヘッダー（レベル、XP含む）
 * - そのシーズンでのユーザーレベル表示
 * - ソーシャルメディアリンク
 * - そのシーズンで獲得したバッジ
 * - ミッション達成状況
 * - 活動タイムライン
 * - 全シーズン履歴
 */
import UserDetailActivities from "@/app/users/[id]/user-detail-activities";
import { Card } from "@/components/ui/card";
import { SocialBadge } from "@/components/ui/social-badge";
import { UserMissionAchievements } from "@/components/user-mission-achievements";
import { UserSeasonHeader } from "@/components/user-season-header";
import { UserSeasonHistory } from "@/components/user-season-history";
import {
  getUserActivityTimeline,
  getUserActivityTimelineCount,
} from "@/features/user-activity/services/timeline";
import { UserBadges } from "@/features/user-badges/components/user-badges";
import Levels from "@/features/user-level/components/levels";
import { getSeasonBySlug, getUserSeasonHistory } from "@/lib/services/seasons";
import { getUserRepeatableMissionAchievements } from "@/lib/services/userMissionAchievement";
import { createClient } from "@/lib/supabase/client";

/** 活動タイムラインの1ページあたりの表示件数 */
const PAGE_SIZE = 20;

type Params = {
  slug: string;
  userId: string;
};

type Props = {
  params: Promise<Params>;
};

export default async function SeasonUserDetailPage({ params }: Props) {
  const { slug, userId } = await params;
  const supabase = createClient();

  // シーズン情報を取得
  const season = await getSeasonBySlug(slug);
  if (!season) {
    return <div>シーズンが見つかりません</div>;
  }

  // ユーザー情報を取得
  const { data: user } = await supabase
    .from("public_user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (!user) return <div>ユーザーが見つかりません</div>;

  const [timeline, count, missionAchievements, seasonHistory] =
    await Promise.all([
      getUserActivityTimeline(userId, PAGE_SIZE, 0, season.id), // 初期の活動タイムライン（シーズン指定）
      getUserActivityTimelineCount(userId, season.id), // 活動総数（ページネーション用、シーズン指定）
      getUserRepeatableMissionAchievements(userId, season.id), // ミッション達成状況（シーズン指定）
      getUserSeasonHistory(userId), // 全シーズン履歴
    ]);

  return (
    <div className="flex flex-col items-stretch w-full max-w-xl gap-4">
      {/* シーズン情報ヘッダー */}
      <div className="mx-4 mt-4">
        <UserSeasonHeader season={season} userId={userId} />
      </div>

      {/* ユーザーレベル表示（プログレスバーは非表示） - シーズン用 */}
      <Levels userId={user.id} seasonId={season.id} hideProgress />

      <div className="px-4">
        {/* ソーシャルメディアリンク表示 */}
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

        {/* 獲得バッジセクション（そのシーズンのもののみ） */}
        <Card className="w-full p-4 mt-4">
          <h3 className="text-lg font-bold mb-4">獲得バッジ</h3>
          <UserBadges userId={user.id} seasonId={season.id} />
        </Card>

        {/* ミッション達成状況セクション（活動がある場合のみ表示） */}
        {(count || 0) > 0 && (
          <Card className="w-full p-4 mt-4">
            <UserMissionAchievements
              achievements={missionAchievements}
              totalCount={count || 0}
            />
          </Card>
        )}

        {/* 活動タイムラインセクション */}
        <Card className="w-full p-4 mt-4">
          <div className="flex flex-row justify-between items-center mb-2">
            <span className="text-lg font-bold">活動タイムライン</span>
          </div>
          {/* クライアントサイドページネーション付きの活動タイムライン */}
          <UserDetailActivities
            userId={userId}
            initialTimeline={timeline}
            pageSize={PAGE_SIZE}
            totalCount={count}
            seasonId={season.id}
          />
        </Card>

        {/* シーズン履歴セクション */}
        {seasonHistory.length > 0 && (
          <Card className="w-full p-4 mt-4">
            <h3 className="text-lg font-bold mb-4">シーズン履歴</h3>
            <UserSeasonHistory userId={user.id} seasonHistory={seasonHistory} />
          </Card>
        )}
      </div>
    </div>
  );
}
