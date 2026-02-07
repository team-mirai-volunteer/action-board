import { ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrefectureTeamUserCardContent } from "@/features/prefecture-team/components/prefecture-team-user-card-content";
import {
  getPrefectureTeamRanking,
  getUserPrefectureContribution,
} from "@/features/prefecture-team/loaders/prefecture-team-loaders";
import { getProfile, getUser } from "@/features/user-profile/services/profile";
import { getCurrentSeason } from "@/lib/loaders/seasons-loaders";

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
    getUserPrefectureContribution(user.id, currentSeason.id),
  ]);

  const userPrefectureRanking = rankings.find(
    (r) => r.prefecture === userProfile.address_prefecture,
  );

  // ランキングデータが取得できない場合
  if (!userPrefectureRanking || !userContribution) {
    return <SimplePrefectureTeamCard />;
  }

  return (
    <Link href="/prefecture-team">
      <Card className="">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              都道府県チームパワー
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PrefectureTeamUserCardContent
            prefectureRanking={userPrefectureRanking}
            userContribution={userContribution}
          />
        </CardContent>
      </Card>
    </Link>
  );
}

function SimplePrefectureTeamCard() {
  return (
    <Link href="/prefecture-team">
      <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 rounded-full p-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="font-bold text-gray-900">
                都道府県チームパワー
              </div>
              <div className="text-xs text-gray-500">
                あなたの都道府県のチームパワーを確認
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </CardContent>
      </Card>
    </Link>
  );
}
