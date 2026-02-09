import { redirect } from "next/navigation";
import NoticeBoardAlert from "@/components/common/notice-board-alert";
import Hero from "@/components/top/hero";
import { PrefectureTeamCard } from "@/components/top/prefecture-team-card";
import { MetricsWithSuspense } from "@/features/metrics/components/metrics-with-suspense";
import FeaturedMissions from "@/features/missions/components/featured-missions";
import MissionsByCategory from "@/features/missions/components/missions-by-category";
import { hasFeaturedMissions } from "@/features/missions/services/missions";
import RankingSection from "@/features/ranking/components/ranking-section";
import Activities from "@/features/user-activity/components/activities";
import { getUnnotifiedBadges } from "@/features/user-badges/services/get-unnotified-badges";
import { BadgeNotificationCheck } from "@/features/user-badges-notification/components/badge-notification-check";
import { LevelUpCheck } from "@/features/user-level/components/level-up-check";
import { checkLevelUpNotification } from "@/features/user-level/services/level-up-notification";
import {
  getUser,
  hasPrivateProfile,
} from "@/features/user-profile/services/profile";
import { getCurrentSeasonId } from "@/lib/services/seasons";
import { generateRootMetadata } from "@/lib/utils/metadata";

// メタデータ生成を外部関数に委譲
export const generateMetadata = generateRootMetadata;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const params = await searchParams;
  const _referralCode = params.ref;

  const user = await getUser();

  // レベルアップ通知とバッジ通知をチェック
  let levelUpNotification = null;
  let badgeNotifications = null;

  if (user) {
    const hasProfile = await hasPrivateProfile(user.id);
    if (!hasProfile) {
      redirect("/settings/profile?new=true");
    }

    // 現在のシーズンIDを取得
    const currentSeasonId = await getCurrentSeasonId();

    // レベルアップ通知をチェック
    // 自動ミッション（紹介など）でレベルアップした場合の通知を表示するため有効化
    const levelUpCheck = await checkLevelUpNotification(user.id);
    if (levelUpCheck.shouldNotify && levelUpCheck.levelUp) {
      levelUpNotification = levelUpCheck.levelUp;
    }

    // バッジ通知をチェック（現在のシーズンのみ）
    const unnotifiedBadges = await getUnnotifiedBadges(
      user.id,
      currentSeasonId ?? undefined,
    );
    if (unnotifiedBadges.length > 0) {
      badgeNotifications = unnotifiedBadges;
    }
  }

  //フューチャードミッションの存在確認
  const showFeatured = await hasFeaturedMissions();

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* レベルアップ通知 */}
      {levelUpNotification && (
        <LevelUpCheck levelUpData={levelUpNotification} />
      )}

      {/* バッジ通知 */}
      {badgeNotifications && (
        <BadgeNotificationCheck badgeData={badgeNotifications} />
      )}

      {/* ヒーローセクション */}
      <section className="relative">
        <Hero />
      </section>
      {/* 注意書き */}
      <NoticeBoardAlert />

      {/* 都道府県対抗ランキング導線 */}
      {user != null && (
        <section className="py-4 md:py-8">
          <div className="w-full max-w-lg mx-auto px-4">
            <PrefectureTeamCard />
          </div>
        </section>
      )}

      {/* メトリクスセクション */}
      <MetricsWithSuspense />

      {/* アクティビティセクション */}
      <section className="py-12 md:py-16 bg-background">
        <Activities />
      </section>

      {/* ランキングセクション */}
      <section className="md:py-16 bg-background">
        <RankingSection />
      </section>
      <div className="w-full md:container md:mx-auto">
        {/* フューチャードミッションセクション */}
        {showFeatured && (
          <section className="py-12 md:py-16 bg-background">
            <FeaturedMissions userId={user?.id} showAchievedMissions={true} />
          </section>
        )}

        {/* ミッションセクション */}
      </div>
      <section className="py-12 md:py-16 bg-background">
        <MissionsByCategory
          userId={user?.id}
          showAchievedMissions={true}
          id="missions"
        />
      </section>
    </div>
  );
}
