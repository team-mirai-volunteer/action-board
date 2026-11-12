import { redirect } from "next/navigation";
import NoticeBoardAlert from "@/components/common/notice-board-alert";
import Hero from "@/components/top/hero";
import { PrefectureTeamCard } from "@/components/top/prefecture-team-card";
import { SupporterQuickLinks } from "@/components/top/supporter-quick-links";
import { TopSectionLayout } from "@/components/top/top-section-layout";
import { MetricsWithSuspense } from "@/features/metrics/components/metrics-with-suspense";
import FeaturedMissions from "@/features/missions/components/featured-missions";
import FirstMissions from "@/features/missions/components/first-missions";
import MissionsByCategory from "@/features/missions/components/missions-by-category";
import { hasFeaturedMissions } from "@/features/missions/services/missions";
import RankingSection from "@/features/ranking/components/ranking-section";
import Activities from "@/features/user-activity/components/activities";
import { getUnnotifiedBadges } from "@/features/user-badges/services/get-unnotified-badges";
import { BadgeNotificationCheck } from "@/features/user-badges-notification/components/badge-notification-check";
import { LevelUpCheck } from "@/features/user-level/components/level-up-check";
import { checkLevelUpNotification } from "@/features/user-level/loaders/level-up-loaders";
import {
  getUser,
  hasPrivateProfile,
} from "@/features/user-profile/services/profile";
import { getCurrentSeasonId } from "@/lib/loaders/seasons-loaders";
import { generateRootMetadata } from "@/lib/utils/metadata";

// メタデータ生成を外部関数に委譲
export const generateMetadata = generateRootMetadata;

/**
 * トップページ下部の統計系セクション（都道府県チームパワー・サポーター数・活動タイムライン）の表示フラグ
 *
 * これらはユーザーメニュー（ダッシュボード / 都道府県チームパワー / 活動タイムライン）から
 * 各ページへ遷移できるため、トップでは非表示にしている。true に戻せば従来どおり表示される。
 */
const SHOW_STATS_SECTIONS = false;

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
    const levelUpCheck = await checkLevelUpNotification();
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

      {/* サポーター向けリンク（サポーターポータル / イベントカレンダー、ログイン時のみ） */}
      {user != null && <SupporterQuickLinks />}

      {/* ランキングセクション */}
      <section className="md:py-16 bg-background">
        <RankingSection />
      </section>
      {/* はじめのミッションセクション（すべて達成済みならセクションごと非表示） */}
      <FirstMissions userId={user?.id} />

      {/* フューチャードミッションセクション */}
      {showFeatured && (
        <section className="py-12 md:py-16 bg-background">
          <FeaturedMissions userId={user?.id} showAchievedMissions={true} />
        </section>
      )}

      {/* ミッションセクション */}
      <section className="py-12 md:py-16 bg-background">
        <MissionsByCategory
          userId={user?.id}
          showAchievedMissions={true}
          id="missions"
        />
      </section>

      {/* 統計系セクション（都道府県チームパワー・サポーター数・活動タイムライン）
          現在はユーザーメニューからの導線に集約しているためトップでは非表示 */}
      {SHOW_STATS_SECTIONS && (
        <>
          {/* 都道府県対抗ランキング導線（ログイン時のみ） */}
          {user != null && (
            <section className="py-12 md:py-16 bg-background">
              <TopSectionLayout title="📍 都道府県チームパワー">
                <PrefectureTeamCard />
              </TopSectionLayout>
            </section>
          )}

          {/* メトリクスセクション */}
          <MetricsWithSuspense />

          {/* アクティビティセクション */}
          <section className="py-12 md:py-16 bg-background">
            <Activities />
          </section>
        </>
      )}
    </div>
  );
}
