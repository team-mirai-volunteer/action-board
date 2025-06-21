import Activities from "@/components/activities";
import Hero from "@/components/hero";
import { LevelUpCheck } from "@/components/level-up-check";
import Metrics from "@/components/metrics";
import FeaturedMissions from "@/components/mission/FeaturedMissions";
import MissionsByCategory from "@/components/mission/MissionsByCategory";
import Missions from "@/components/mission/missions";
import RankingTop from "@/components/ranking/ranking-top";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { generateRootMetadata } from "@/lib/metadata";
import { checkLevelUpNotification } from "@/lib/services/levelUpNotification";
import { hasFeaturedMissions } from "@/lib/services/missions";
import { createClient } from "@/lib/supabase/server";
import { Edit3, MessageCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

// メタデータ生成を外部関数に委譲
export const generateMetadata = generateRootMetadata;

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // レベルアップ通知をチェック
  let levelUpNotification = null;

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
  }

  //フューチャードミッションの存在確認
  const showFeatured = await hasFeaturedMissions();

  return (
    <div className="flex flex-col min-h-screen py-4">
      {/* レベルアップ通知 */}
      {levelUpNotification && (
        <LevelUpCheck levelUpData={levelUpNotification} />
      )}

      {/* ヒーローセクション */}
      <section>
        <Hero />
      </section>

      {/* メトリクスセクション */}
      <section className="py-12 md:py-16 bg-white">
        <Metrics />
      </section>

      {/* ランキングセクション */}
      <section className="py-12 md:py-16 bg-white">
        <RankingTop limit={5} showDetailedInfo={true} />
      </section>

      {/* フューチャードミッションセクション */}
      {showFeatured && (
        <section className="py-12 md:py-16 bg-white">
          <FeaturedMissions userId={user?.id} showAchievedMissions={true} />
        </section>
      )}

      {/* ミッションセクション */}
      <section className="py-12 md:py-16 bg-white">
        <MissionsByCategory userId={user?.id} showAchievedMissions={true} />
      </section>

      {/* アクティビティセクション */}
      <section className="py-12 md:py-16 bg-white">
        <Activities />
      </section>

      {/* ご意見箱セクション */}
      <Card className="py-12 md:py-16 mx-4">
        <div className="mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl p-8 md:p-12">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mb-4">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                ご意見をお聞かせください
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                チームみらいアクションボードをより良いサービスにするため、
                皆様のご意見・ご要望をお聞かせください。
                いただいたフィードバックは今後の改善に活用させていただきます。
              </p>
            </div>
            <Link
              href="https://team-mirai.notion.site/204f6f56bae1800da8d5dd9c61dd7cd1?pvs=105"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              >
                <Edit3 className="w-5 h-5 mr-2" />
                ご意見箱を開く
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
