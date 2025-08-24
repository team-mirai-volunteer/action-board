import { Card } from "@/components/ui/card";
import { SocialBadge } from "@/components/ui/social-badge";
import { UserMissionAchievements } from "@/components/user-mission-achievements";
import { UserSeasonHistory } from "@/components/user-season-history";
import {
  getUserActivityTimeline,
  getUserActivityTimelineCount,
} from "@/features/user-activity/services/timeline";
import { UserBadges } from "@/features/user-badges/components/user-badges";
/**
 * ユーザー詳細ページ
 *
 * このページは以下の機能を提供します：
 * - ユーザーの基本情報表示（レベル、ソーシャルリンク）
 * - 獲得バッジの表示
 * - ミッション達成状況の表示
 * - 活動タイムラインの表示（ページネーション付き）
 *
 * パフォーマンス最適化：
 * - Promise.allを使用した並列データ取得
 * - 初期データをクライアントコンポーネントに渡してSSR最適化
 */
import Levels from "@/features/user-level/components/levels";
import {
  getCurrentSeasonId,
  getUserSeasonHistory,
} from "@/lib/services/seasons";
import { getUserRepeatableMissionAchievements } from "@/lib/services/userMissionAchievement";
import { createClient } from "@/lib/supabase/client";
import UserDetailActivities from "./user-detail-activities";

/** 活動タイムラインの1ページあたりの表示件数 */
const PAGE_SIZE = 20;

type Params = {
  id: string;
};

type Props = {
  params: Promise<Params>;
};

export default async function UserDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createClient();

  const { data: user } = await supabase
    .from("public_user_profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!user) return <div>ユーザーが見つかりません</div>;

  // 現在のシーズンIDを取得
  const currentSeasonId = await getCurrentSeasonId();

  const [timeline, count, missionAchievements, seasonHistory] =
    await Promise.all([
      getUserActivityTimeline(id, PAGE_SIZE, 0, currentSeasonId ?? undefined), // 初期の活動タイムライン（現在のシーズン）
      getUserActivityTimelineCount(id, currentSeasonId ?? undefined), // 活動総数（現在のシーズン）
      getUserRepeatableMissionAchievements(id, currentSeasonId ?? undefined), // ミッション達成状況（現在のシーズン）
      getUserSeasonHistory(id), // シーズン履歴
    ]);

  return (
    <div className="flex flex-col items-stretch w-full max-w-xl gap-4">
      {/* ユーザーレベル表示（プログレスバーは非表示） */}
      <Levels
        userId={user.id}
        hideProgress
        seasonId={currentSeasonId ?? undefined}
      />

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

        {/* 獲得バッジセクション */}
        <Card className="w-full p-4 mt-4">
          <h3 className="text-lg font-bold mb-4">獲得バッジ</h3>
          <UserBadges
            userId={user.id}
            seasonId={currentSeasonId ?? undefined}
          />
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
            userId={id}
            initialTimeline={timeline}
            pageSize={PAGE_SIZE}
            totalCount={count}
            seasonId={currentSeasonId ?? undefined}
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
