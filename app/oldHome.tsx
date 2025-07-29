import NoticeBoardAlert from "@/components/NoticeBoardAlert";
import Activities from "@/components/activities";
import { BadgeNotificationCheck } from "@/components/badge-notification-check";
import { FeaturedMissions } from "@/components/features/mission/components/FeaturedMissions";
import Missions from "@/components/features/mission/components/Missions";
import { MissionsByCategory } from "@/components/features/mission/components/MissionsByCategory";
import Hero from "@/components/hero";
import { LevelUpCheck } from "@/components/level-up-check";
import MetricsWithSuspense from "@/components/metrics/MetricsWithSuspense";
import RankingTop from "@/components/ranking/ranking-top";
import RankingSection from "@/components/top/ranking-section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { generateRootMetadata } from "@/lib/metadata";
import { checkBadgeNotifications } from "@/lib/services/badgeNotification";
import { checkLevelUpNotification } from "@/lib/services/levelUpNotification";
import { hasFeaturedMissions } from "@/lib/services/missions";
import { createClient } from "@/lib/supabase/server";
import { Edit3, MessageCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

// メタデータ生成を外部関数に委譲
export const generateMetadata = generateRootMetadata;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const supabase = await createClient();
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

    // レベルアップ通知をチェック
    // 自動ミッション（紹介など）でレベルアップした場合の通知を表示するため有効化
    const levelUpCheck = await checkLevelUpNotification(user.id);
    if (levelUpCheck.shouldNotify && levelUpCheck.levelUp) {
      levelUpNotification = levelUpCheck.levelUp;
    }

    // バッジ通知をチェック
    const badgeCheck = await checkBadgeNotifications(user.id);
    if (badgeCheck.hasNewBadges && badgeCheck.newBadges) {
      badgeNotifications = badgeCheck.newBadges;
    }
  }

  //フューチャードミッションの存在確認
  const showFeatured = await hasFeaturedMissions();

  return (
    <div className="flex flex-col min-h-screen">
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
            <FeaturedMissions
              missions={[]}
              userAchievements={{}}
              totalAchievements={{}}
            />
          </section>
        )}

        {/* ミッションセクション */}
      </div>
      <section className="py-12 md:py-16 bg-white">
        <MissionsByCategory
          missions={[]}
          userAchievements={{}}
          totalAchievements={{}}
        />
      </section>

      {/* アクティビティセクション */}
      <section className="py-12 md:py-16 bg-white">
        <Activities />
      </section>
    </div>
  );
}
