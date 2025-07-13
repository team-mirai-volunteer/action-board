/**
 * ホームページコンポーネント
 *
 * このページは以下の機能を提供します：
 * - ユーザー認証状態の確認
 * - レベルアップ通知の表示
 * - バッジ獲得通知の表示
 * - ヒーローセクション
 * - メトリクス表示
 * - ランキング表示
 * - フィーチャードミッション表示
 * - カテゴリ別ミッション表示
 * - 活動タイムライン表示
 *
 * 通知システム：
 * - レベルアップ通知：自動ミッション（紹介など）でのレベルアップを通知
 * - バッジ通知：新しく獲得したバッジを通知
 *
 * パフォーマンス最適化：
 * - 条件分岐による不要な処理のスキップ
 * - Suspenseを使用した段階的ローディング
 */
import Activities from "@/components/activities";
import { BadgeNotificationCheck } from "@/components/badge-notification-check";
import Hero from "@/components/hero";
import { LevelUpCheck } from "@/components/level-up-check";
import MetricsWithSuspense from "@/components/metrics/MetricsWithSuspense";
import FeaturedMissions from "@/components/mission/FeaturedMissions";
import MissionsByCategory from "@/components/mission/MissionsByCategory";
import Missions from "@/components/mission/missions";
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

    // レベルアップ通知の確認
    // 自動ミッション（紹介コード使用など）でレベルアップした場合の通知を表示
    const levelUpCheck = await checkLevelUpNotification(user.id);
    if (levelUpCheck.shouldNotify && levelUpCheck.levelUp) {
      levelUpNotification = levelUpCheck.levelUp;
    }

    const badgeCheck = await checkBadgeNotifications(user.id);
    if (badgeCheck.hasNewBadges && badgeCheck.newBadges) {
      badgeNotifications = badgeCheck.newBadges;
    }
  }

  // フィーチャードミッションの存在確認
  const showFeatured = await hasFeaturedMissions();

  return (
    <div className="flex flex-col min-h-screen">
      {/* レベルアップ通知モーダル */}
      {/* 自動ミッション達成などでレベルアップした場合に表示 */}
      {levelUpNotification && (
        <LevelUpCheck levelUpData={levelUpNotification} />
      )}

      {/* バッジ獲得通知モーダル */}
      {/* 新しくバッジを獲得した場合に表示 */}
      {badgeNotifications && (
        <BadgeNotificationCheck badgeData={badgeNotifications} />
      )}

      {/* ヒーローセクション */}
      {/* メインビジュアルとキャッチコピーを表示 */}
      <section>
        <Hero />
      </section>

      <div className="w-full md:container md:mx-auto py-4">
        {/* メトリクスセクション */}
        {/* 全体の統計情報をSuspenseで段階的に表示 */}
        <MetricsWithSuspense />

        {/* ランキングセクション */}
        {/* ユーザーランキングと現在のユーザー順位を表示 */}
        <section className="py-12 md:py-16 bg-white">
          <RankingSection />
        </section>

        {/* フィーチャードミッションセクション */}
        {/* 管理者が設定した注目ミッションがある場合のみ表示 */}
        {showFeatured && (
          <section className="py-12 md:py-16 bg-white">
            <FeaturedMissions userId={user?.id} showAchievedMissions={true} />
          </section>
        )}

        {/* ミッションセクション */}
        {/* カテゴリ別のミッション一覧を表示 */}
      </div>
      <section className="py-12 md:py-16 bg-white">
        <MissionsByCategory
          userId={user?.id}
          showAchievedMissions={true}
          id="missions"
        />
      </section>

      {/* 活動タイムラインセクション */}
      {/* 最新の活動10件をリアルタイムで表示 */}
      <section className="py-12 md:py-16 bg-white">
        <Activities />
      </section>
    </div>
  );
}
