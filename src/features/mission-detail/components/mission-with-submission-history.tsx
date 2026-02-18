"use client";

import type { User } from "@supabase/supabase-js";
import { useState } from "react";
import { CopyReferralButton } from "@/features/mission-detail/components/copy-referral-button";
import { MissionFormWrapper } from "@/features/mission-detail/components/mission-form-wrapper";
import QRCodeDisplay from "@/features/mission-detail/components/qr-code-display";
import { SubmissionHistoryWrapper } from "@/features/mission-detail/components/submission-history-wrapper";
import { getSubmissionHistory } from "@/features/mission-detail/loaders/mission-detail-loaders";
import type { SubmissionData } from "@/features/mission-detail/types/detail-types";

import { MissionGuidanceArrow } from "@/features/missions/components/mission-guidance-arrow";
import { useMissionSubmission } from "@/features/missions/hooks/use-mission-submission";
import { ARTIFACT_TYPES } from "@/lib/types/artifact-types";
import type { Tables } from "@/lib/types/supabase";
import { MainLinkButton } from "./main-link-button";

type Props = {
  mission: Tables<"missions">;
  authUser: User;
  referralCode: string | null;
  initialUserAchievementCount: number;
  initialSubmissions: SubmissionData[];
  missionId: string;
  preloadedQuizQuestions?:
    | {
        id: string;
        question: string;
        options: string[];
        category?: string;
      }[]
    | null;
  mainLink: Tables<"mission_main_links"> | null;
};

export function MissionWithSubmissionHistory({
  mission,
  authUser,
  referralCode,
  initialUserAchievementCount,
  initialSubmissions,
  missionId,
  preloadedQuizQuestions,
  mainLink,
}: Props) {
  const [submissions, setSubmissions] =
    useState<SubmissionData[]>(initialSubmissions);
  const [userAchievementCount, setUserAchievementCount] = useState(
    initialUserAchievementCount,
  );

  // useMissionSubmissionフックを使用して統一
  const { hasReachedUserMaxAchievements } = useMissionSubmission(
    mission,
    userAchievementCount,
  );

  const refreshSubmissions = async () => {
    try {
      // 新しい記録後は最新20件を再取得
      const data = await getSubmissionHistory(missionId, 20);
      setSubmissions(data);
      setUserAchievementCount((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to refresh submissions:", error);
    }
  };

  // クライアントサイドでのみwindow.location.originを使用
  const origin =
    process.env.NEXT_PUBLIC_APP_ORIGIN ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const signupUrl = `${origin}/?ref=${referralCode}`;

  // LINK,QUIZ,リファラルは視覚的導線を表示しない
  const isNoGuidanceArrow =
    mission.required_artifact_type === ARTIFACT_TYPES.LINK_ACCESS.key ||
    mission.required_artifact_type === ARTIFACT_TYPES.QUIZ.key ||
    mission.required_artifact_type === ARTIFACT_TYPES.REFERRAL.key;

  // フォームが表示される条件と同じ
  const shouldShowGuidanceArrow =
    (!hasReachedUserMaxAchievements ||
      mission.required_artifact_type === ARTIFACT_TYPES.LINK_ACCESS.key) &&
    !isNoGuidanceArrow;

  return (
    <>
      {/* リンクアクセスのボタンは別で表示しているので、ここでは除外 */}
      {mission.required_artifact_type !== ARTIFACT_TYPES.LINK_ACCESS.key &&
        mainLink != null && (
          <MainLinkButton
            mission={mission}
            mainLink={mainLink}
            isDisabled={false}
          />
        )}
      {/* フォームと同じ条件で視覚的導線を表示 */}
      {shouldShowGuidanceArrow && <MissionGuidanceArrow />}
      {mission.required_artifact_type === "REFERRAL" &&
        authUser &&
        referralCode && (
          <div className="bg-white rounded-xl border-2 p-6 flex flex-col items-center">
            <p className="mb-2 font-semibold text-center text-lg">
              あなた専用紹介URL
            </p>
            <p className="text-sm text-muted-foreground">
              あなた専用の紹介URLを周りの人に共有して、紹介URLから登録が完了すると、自動でミッションクリア回数がカウントされます。
            </p>
            <p className="text-sm mt-4 font-bold">QRコードをスキャン</p>
            <QRCodeDisplay value={signupUrl} />
            <p className="text-sm">または</p>
            <CopyReferralButton referralUrl={signupUrl} />
          </div>
        )}

      {mission.required_artifact_type !== "REFERRAL" && (
        <MissionFormWrapper
          mission={mission}
          authUser={authUser}
          userAchievementCount={userAchievementCount}
          onSubmissionSuccess={refreshSubmissions}
          preloadedQuizQuestions={preloadedQuizQuestions}
          mainLink={mainLink}
        />
      )}

      {submissions.length > 0 && (
        <SubmissionHistoryWrapper
          submissions={submissions}
          missionId={missionId}
          userId={authUser.id}
        />
      )}
    </>
  );
}
