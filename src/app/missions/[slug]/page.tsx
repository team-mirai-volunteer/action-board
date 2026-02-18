import { LogIn, Shield } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getQuizQuestionsAction } from "@/features/mission-detail/actions/quiz-actions";
import { MissionWithSubmissionHistory } from "@/features/mission-detail/components/mission-with-submission-history";
import { RelatedMissions } from "@/features/mission-detail/components/related-missions";
import {
  getMissionData,
  getMissionPageData,
  getMissionSlugById,
} from "@/features/mission-detail/loaders/mission-detail-loaders";
import { isUUID } from "@/features/mission-detail/services/mission-detail";
import { MissionDetails } from "@/features/missions/components/mission-details";
import {
  getMissionAchievementCounts,
  getPostingCountsForMissions,
} from "@/features/missions/loaders/missions-loaders";
import { CurrentUserCardMission } from "@/features/ranking/components/current-user-card-mission";
import { RankingMission } from "@/features/ranking/components/ranking-mission";
import {
  getUserMissionRanking,
  getUserPostingCountByMission,
} from "@/features/ranking/loaders/ranking-loaders";
import { getUser } from "@/features/user-profile/services/profile";
import { ARTIFACT_TYPES } from "@/lib/types/artifact-types";
import {
  config,
  createDefaultMetadata,
  defaultUrl,
  notoSansJP,
} from "@/lib/utils/metadata";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  params: Promise<{ slug: string }>;
};

function buildMissionMetadata(
  missionTitle: string,
  slug: string,
  searchParamsResolved: { [key: string]: string | string[] | undefined },
): Metadata {
  let ogpImageUrl = `${defaultUrl}/api/missions/${slug}/og`;
  ogpImageUrl =
    searchParamsResolved.type === "complete"
      ? `${ogpImageUrl}?type=complete`
      : ogpImageUrl;

  return {
    title: `${missionTitle} | ${config.title}`,
    description: config.description,
    openGraph: {
      title: config.title,
      description: config.description,
      images: [ogpImageUrl],
    },
    twitter: {
      card: "summary_large_image",
      title: config.title,
      description: config.description,
      images: [ogpImageUrl],
    },
    icons: config.icons,
    other: {
      "font-family": notoSansJP.style.fontFamily,
    },
  };
}

export async function generateMetadata({
  searchParams,
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;

  // UUIDの場合はslugを取得してリダイレクト用のメタデータを返す
  if (isUUID(slug)) {
    const missionSlug = await getMissionSlugById(slug);
    if (missionSlug) {
      const mission = await getMissionData(missionSlug);
      if (!mission || mission.is_hidden) {
        return createDefaultMetadata();
      }
      const searchParamsResolved = await searchParams;
      return buildMissionMetadata(
        mission.title,
        missionSlug,
        searchParamsResolved,
      );
    }
    return createDefaultMetadata();
  }

  // getMissionDataのみ呼び出し（cache()で重複排除済み、submissions等は不要）
  const mission = await getMissionData(slug);
  if (!mission || mission.is_hidden) {
    return createDefaultMetadata();
  }
  const searchParamsResolved = await searchParams;
  return buildMissionMetadata(mission.title, slug, searchParamsResolved);
}

export default async function MissionPage({ params, searchParams }: Props) {
  const { slug } = await params;

  // UUIDでアクセスされた場合は301リダイレクト
  if (isUUID(slug)) {
    const missionSlug = await getMissionSlugById(slug);
    if (missionSlug) {
      const searchParamsResolved = await searchParams;
      const queryString =
        searchParamsResolved.type === "complete" ? "?type=complete" : "";
      redirect(`/missions/${missionSlug}${queryString}`);
    }
    return <div className="p-4">ミッションが見つかりません。</div>;
  }

  const user = await getUser();
  const pageData = await getMissionPageData(slug);

  if (!pageData) {
    return <div className="p-4">ミッションが見つかりません。</div>;
  }

  const {
    mission,
    submissions,
    userAchievementCount,
    userAchievementCountMap,
    referralCode,
    mainLink,
    allCategoryMissions,
  } = pageData;

  // クイズミッションの場合は問題を事前取得
  let quizQuestions = null;
  if (mission.required_artifact_type === ARTIFACT_TYPES.QUIZ.key) {
    try {
      const quizResponse = await getQuizQuestionsAction(mission.id);
      if (quizResponse.success && quizResponse.questions) {
        quizQuestions = quizResponse.questions;
      }
    } catch (error) {
      console.error("Error fetching quiz questions:", error);
    }
  }

  const isPostingMission = mission.required_artifact_type === "POSTING";

  // 追加クエリを並列実行
  const [
    userWithMissionRanking,
    userPostingCount,
    achievementCountMap,
    postingCountMap,
  ] = await Promise.all([
    user ? getUserMissionRanking(mission.id) : Promise.resolve(null),
    user && isPostingMission
      ? getUserPostingCountByMission(mission.id)
      : Promise.resolve(0),
    getMissionAchievementCounts(),
    getPostingCountsForMissions([
      mission,
      ...allCategoryMissions.flatMap((c) => c.missions),
    ]),
  ]);

  let badgeText = "";
  if (userWithMissionRanking) {
    if (isPostingMission) {
      badgeText = `${userPostingCount.toLocaleString()}枚`;
    } else {
      badgeText = `${(userWithMissionRanking.user_achievement_count ?? 0).toLocaleString()}回`;
    }
  }

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="flex flex-col gap-6 max-w-lg mx-auto">
        <MissionDetails mission={mission} />

        {user ? (
          <>
            <Suspense
              fallback={<div className="text-center p-4">読み込み中...</div>}
            >
              <MissionWithSubmissionHistory
                mission={mission}
                authUser={user}
                referralCode={referralCode}
                initialUserAchievementCount={userAchievementCount}
                initialSubmissions={submissions}
                missionId={mission.id}
                preloadedQuizQuestions={quizQuestions}
                mainLink={mainLink}
              />
            </Suspense>
            {/* ミッションの達成回数が無制限の場合のみ、ユーザーのランキングを表示 */}
            {mission.max_achievement_count === null && (
              <>
                <div className="mt-6">
                  <CurrentUserCardMission
                    currentUser={userWithMissionRanking}
                    mission={mission}
                    badgeText={badgeText}
                  />
                </div>
                <div className="mt-6">
                  <RankingMission
                    limit={10}
                    showDetailedInfo={true}
                    mission={mission}
                    isPostingMission={isPostingMission}
                  />
                </div>
              </>
            )}
          </>
        ) : (
          <Card className="border-dashed border-2 border-muted-foreground/25">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Shield className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle className="text-xl">
                ログインしてミッションを達成しよう
              </CardTitle>
              <CardDescription>
                ミッションを達成するには、アカウントにログインしてください。
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/sign-in">
                <Button className="w-full sm:w-auto">
                  <LogIn className="mr-2 h-4 w-4" />
                  ログインする
                </Button>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground">
                アカウントをお持ちでない方は{" "}
                <Link href="/sign-up" className="text-primary hover:underline">
                  こちらから登録
                </Link>
              </p>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 flex flex-col gap-8">
          {allCategoryMissions.map((categoryData) => (
            <RelatedMissions
              key={categoryData.categoryId}
              missions={categoryData.missions}
              categoryTitle={categoryData.categoryTitle}
              userAchievementCountMap={userAchievementCountMap}
              achievementCountMap={achievementCountMap}
              postingCountMap={postingCountMap}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
