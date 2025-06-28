import { MissionDetails } from "@/components/mission/MissionDetails";
import { MissionGuidanceArrow } from "@/components/mission/MissionGuidanceArrow";
import { CurrentUserCardMission } from "@/components/ranking/current-user-card-mission";
import RankingMission from "@/components/ranking/ranking-mission";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ARTIFACT_TYPES } from "@/lib/artifactTypes";
import {
  config,
  createDefaultMetadata,
  defaultUrl,
  notoSansJP,
} from "@/lib/metadata";
import {
  getUserMissionRanking,
  getUserPostingCount,
} from "@/lib/services/missionsRanking";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { LogIn, Shield } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MissionWithSubmissionHistory } from "./_components/MissionWithSubmissionHistory";
import { getMissionPageData } from "./_lib/data";
import { getQuizQuestionsAction } from "./actions";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  searchParams,
  params,
}: Props): Promise<Metadata> {
  const { id } = await params;
  const pageData = await getMissionPageData(id);
  if (!pageData) {
    return createDefaultMetadata();
  }
  const { mission } = pageData;
  let ogpImageUrl = `${defaultUrl}/api/missions/${id}/og`;

  // searchParamsをogpImageUrlに追加
  const searchParamsResolved = await searchParams;
  ogpImageUrl =
    searchParamsResolved.type === "complete"
      ? `${ogpImageUrl}?type=complete`
      : ogpImageUrl;

  return {
    title: `${mission.title} | ${config.title}`,
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

export default async function MissionPage({ params }: Props) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { id } = await params;
  const pageData = await getMissionPageData(id, user?.id);

  if (!pageData) {
    return <div className="p-4">ミッションが見つかりません。</div>;
  }

  const { mission, submissions, userAchievementCount, referralCode, mainLink } =
    pageData;

  // クイズミッションの場合は問題を事前取得
  let quizQuestions = null;
  if (mission.required_artifact_type === ARTIFACT_TYPES.QUIZ.key) {
    try {
      const quizResponse = await getQuizQuestionsAction(id);
      if (quizResponse.success && quizResponse.questions) {
        quizQuestions = quizResponse.questions;
      }
    } catch (error) {
      console.error("Error fetching quiz questions:", error);
    }
  }

  // ユーザーのミッション別ランキング情報を取得
  const userWithMissionRanking = user
    ? await getUserMissionRanking(id, user.id)
    : null;

  // ミッションタイプに応じてbadgeTextを生成、ポスティングミッションの場合はポスティング枚数を取得
  const isPostingMission = mission.required_artifact_type === "POSTING";
  const userPostingCount =
    user && isPostingMission ? await getUserPostingCount(user.id) : 0;
  let badgeText = "";

  if (userWithMissionRanking) {
    if (isPostingMission) {
      badgeText = `${userPostingCount.toLocaleString()}枚`;
    } else {
      badgeText = `${(userWithMissionRanking.user_achievement_count ?? 0).toLocaleString()}回`;
    }
  }

  const isLinkMission =
    mission.required_artifact_type === ARTIFACT_TYPES.LINK_ACCESS.key;
  const isCompleted =
    userAchievementCount >= (mission.max_achievement_count || 1);

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="flex flex-col gap-6 max-w-lg mx-auto">
        <MissionDetails mission={mission} mainLink={mainLink} />

        {/* LINKミッション以外の場合のみ視覚的導線を表示 */}
        {user && !isLinkMission && <MissionGuidanceArrow />}

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
                missionId={id}
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
                ミッションの達成を報告するには、アカウントにログインしてください。
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
      </div>
    </div>
  );
}
