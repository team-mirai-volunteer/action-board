import { ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";
import { TOP_SECTION_CARD_CLASS_NAME } from "@/components/top/top-section-layout";
import { Card } from "@/components/ui/card";
import { PrefectureTeamUserCardContent } from "@/features/prefecture-team/components/prefecture-team-user-card-content";
import {
  getPrefectureTeamRanking,
  getUserPrefectureContribution,
} from "@/features/prefecture-team/loaders/prefecture-team-loaders";
import { getProfile, getUser } from "@/features/user-profile/services/profile";
import { getCurrentSeason } from "@/lib/loaders/seasons-loaders";
import { cn } from "@/lib/utils";

export async function PrefectureTeamCard() {
  const [user, currentSeason] = await Promise.all([
    getUser(),
    getCurrentSeason(),
  ]);

  // 未ログインまたはシーズンがない場合はシンプルなカードを表示
  if (!user || !currentSeason) {
    return <div />;
  }

  const userProfile = await getProfile(user.id);

  // 都道府県が設定されていない、または海外の場合
  if (
    !userProfile?.address_prefecture ||
    userProfile.address_prefecture === "海外"
  ) {
    return <SimplePrefectureTeamCard />;
  }

  const [rankings, userContribution] = await Promise.all([
    getPrefectureTeamRanking(currentSeason.id),
    getUserPrefectureContribution(currentSeason.id),
  ]);

  const userPrefectureRanking = rankings.find(
    (r) => r.prefecture === userProfile.address_prefecture,
  );

  // ランキングデータが取得できない場合
  if (!userPrefectureRanking || !userContribution) {
    return <SimplePrefectureTeamCard />;
  }

  return (
    <Link href="/prefecture-team" className="block">
      {/* 見出しはセクション側（TopSectionLayout）に出すため、カード内のタイトル行は置かない */}
      <Card className={TOP_SECTION_CARD_CLASS_NAME}>
        <PrefectureTeamUserCardContent
          prefectureRanking={userPrefectureRanking}
          userContribution={userContribution}
        />
      </Card>
    </Link>
  );
}

function SimplePrefectureTeamCard() {
  return (
    <Link href="/prefecture-team" className="block">
      {/* 見出しはセクション側に出すため、カード内は導線の説明文だけにする */}
      <Card
        className={cn(
          TOP_SECTION_CARD_CLASS_NAME,
          "hover:shadow-md cursor-pointer flex items-center justify-between",
        )}
      >
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 rounded-full p-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-sm text-gray-600">
            あなたの都道府県のチームパワーを確認
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </Card>
    </Link>
  );
}
