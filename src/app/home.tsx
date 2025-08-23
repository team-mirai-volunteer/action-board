import NoticeBoardAlert from "@/components/NoticeBoardAlert";
import Activities from "@/components/activities";
import Hero from "@/components/hero";
import { LevelUpCheck } from "@/components/level-up-check";
import FeaturedMissions from "@/components/mission/FeaturedMissions";
import MissionsByCategory from "@/components/mission/MissionsByCategory";
import RankingSection from "@/components/top/ranking-section";
import { MetricsWithSuspense } from "@/features/metrics/components/metrics-with-suspense";
import { BadgeNotificationCheck } from "@/features/user-badges-notification/components/badge-notification-check";
import { getUnnotifiedBadges } from "@/features/user-badges/services/get-unnotified-badges";
import { generateRootMetadata } from "@/lib/metadata";
import { checkLevelUpNotification } from "@/lib/services/levelUpNotification";
import { hasFeaturedMissions } from "@/lib/services/missions";
import { getCurrentSeasonId } from "@/lib/services/seasons";
import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";

// メタデータ生成を外部関数に委譲
export const generateMetadata = generateRootMetadata;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const supabase = createClient();
  const params = await searchParams;
  const referralCode = params.ref;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // レベルアップ通知とバッジ通知をチェック
  let levelUpNotification = null;
  let badgeNotifications = null;

  if (user) {
    const { data: privateUser } = await supabase
      .from("private_users")
      .select("id")
      .eq("id", user.id)
      .single();
    if (!privateUser) {
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
      {/* 注意書き */}
      <NoticeBoardAlert />

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

      <div className="w-full md:container md:mx-auto py-4">
        {/* メトリクスセクション */}
        <MetricsWithSuspense />

        {/* ランキングセクション */}
        <section className="py-12 md:py-16 bg-white">
          <RankingSection />
        </section>

        {/* フューチャードミッションセクション */}
        {showFeatured && (
          <section className="py-12 md:py-16 bg-white">
            <FeaturedMissions userId={user?.id} showAchievedMissions={true} />
          </section>
        )}

        {/* ミッションセクション */}
      </div>
      <section className="py-12 md:py-16 bg-white">
        <MissionsByCategory
          userId={user?.id}
          showAchievedMissions={true}
          id="missions"
        />
      </section>

      {/* アクティビティセクション */}
      <section className="py-12 md:py-16 bg-white">
        <Activities />
      </section>
    </div>
  );
}
