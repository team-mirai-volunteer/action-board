import type { Metadata } from "next";
import { PrefectureTeamGoalBanner } from "@/features/prefecture-team/components/prefecture-team-goal-banner";
import { PrefectureTeamTabs } from "@/features/prefecture-team/components/prefecture-team-tabs";
import { PrefectureTeamUserCard } from "@/features/prefecture-team/components/prefecture-team-user-card";
import {
  getPrefectureTeamRanking,
  getUserPrefectureContribution,
} from "@/features/prefecture-team/loaders/prefecture-team-loaders";
import type {
  PrefectureTeamRanking as PrefectureTeamRankingType,
  UserPrefectureContribution,
} from "@/features/prefecture-team/types/prefecture-team-types";
import { getProfile, getUser } from "@/features/user-profile/services/profile";
import { getCurrentSeason } from "@/lib/loaders/seasons-loaders";
import type { Tables } from "@/lib/types/supabase";

export const metadata: Metadata = {
  title: "都道府県チームパワー - アクションボード",
  description: "あなたの都道府県チームパワーを確認しましょう",
};

export default async function PrefectureTeamPage() {
  const [user, currentSeason] = await Promise.all([
    getUser(),
    getCurrentSeason(),
  ]);

  if (!currentSeason) {
    return (
      <div className="flex flex-col items-center min-h-screen py-4 w-full">
        <div className="p-4 text-gray-500">
          現在のシーズンが見つかりません。
        </div>
      </div>
    );
  }

  // ランキングデータを取得
  const rankings = await getPrefectureTeamRanking(currentSeason.id);

  // ユーザー関連のデータを取得
  let userProfile: Tables<"public_user_profiles"> | null = null;
  let userContribution: UserPrefectureContribution | null = null;
  let userPrefectureRanking: PrefectureTeamRankingType | undefined;

  if (user) {
    userProfile = await getProfile(user.id);

    if (
      userProfile?.address_prefecture &&
      userProfile.address_prefecture !== "海外"
    ) {
      userContribution = await getUserPrefectureContribution(
        user.id,
        currentSeason.id,
      );
      userPrefectureRanking = rankings.find(
        (r) => r.prefecture === userProfile?.address_prefecture,
      );
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen py-4 w-full">
      <h2 className="text-2xl font-bold text-center mb-2">
        都道府県チームパワー
      </h2>
      <p className="text-sm text-gray-600 text-center mb-4 px-4">
        あなたのアクションで地域を盛り上げよう！
      </p>

      <div className="w-full max-w-xl px-4 space-y-6">
        {/* ユーザーの県カード */}
        {userPrefectureRanking && userContribution && (
          <PrefectureTeamUserCard
            prefectureRanking={userPrefectureRanking}
            userContribution={userContribution}
          />
        )}
        <p className="text-xs text-gray-600 text-center mb-6 px-4">
          ※ チームパワーは「都道府県のXP合計 ÷ 人口（万人）」で計算されています
        </p>

        {/* 目標バナー */}
        {userPrefectureRanking && (
          <PrefectureTeamGoalBanner
            currentPrefectureRanking={userPrefectureRanking}
            rankings={rankings}
          />
        )}

        {/* タブ（地図/ランキング表） */}
        <PrefectureTeamTabs
          rankings={rankings}
          userPrefecture={userProfile?.address_prefecture}
        />
      </div>
    </div>
  );
}
