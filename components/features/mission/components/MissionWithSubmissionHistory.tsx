"use client";

import { MissionGuidanceArrow } from "@/components/mission/MissionGuidanceArrow";
import { ARTIFACT_TYPES } from "@/lib/artifactTypes";
import { createClient } from "@/lib/supabase/client";
import type { SubmissionData } from "@/lib/types/domain";
import type { Tables } from "@/lib/types/supabase";
import type { User } from "@supabase/supabase-js";
import { useState } from "react";
import QRCode from "react-qr-code";
import { MissionFormWrapper } from "../forms/MissionFormWrapper";
import { useMissionSubmission } from "../hooks/useMissionSubmission";
import { CopyReferralButton } from "./CopyReferralButton";
import QRCodeDisplay from "./QRCodeDisplay";
import { SubmissionHistoryWrapper } from "./SubmissionHistoryWrapper";

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
  mainLink?: Tables<"mission_main_links"> | null;
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

  const { hasReachedUserMaxAchievements } = useMissionSubmission(
    mission,
    userAchievementCount,
  );

  const refreshSubmissions = async () => {
    try {
      const supabase = createClient();

      const { data: achievementsData, error: achievementsError } =
        await supabase
          .from("achievements")
          .select("id, created_at, mission_id, user_id")
          .eq("user_id", authUser.id)
          .eq("mission_id", missionId)
          .order("created_at", { ascending: false });

      if (achievementsError) {
        console.error("Achievements fetch error:", achievementsError);
        return;
      }

      const achievementIds = achievementsData?.map((a) => a.id) || [];

      if (achievementIds.length === 0) {
        setSubmissions([]);
        setUserAchievementCount(0);
        return;
      }

      const { data: artifactsData, error: artifactsError } = await supabase
        .from("mission_artifacts")
        .select("*")
        .in("achievement_id", achievementIds)
        .order("created_at", { ascending: false });

      if (artifactsError) {
        console.error("Artifacts fetch error:", artifactsError);
        return;
      }

      const submissionsWithArtifacts: SubmissionData[] =
        achievementsData?.map((achievement) => {
          const artifact = artifactsData?.find(
            (a) => a.achievement_id === achievement.id,
          );
          return {
            id: achievement.id,
            created_at: achievement.created_at,
            mission_id: achievement.mission_id,
            user_id: achievement.user_id,
            artifact: artifact || null,
          };
        }) || [];

      setSubmissions(submissionsWithArtifacts);
      setUserAchievementCount(achievementsData?.length || 0);
    } catch (error) {
      console.error("Error refreshing submissions:", error);
    }
  };

  const shouldShowQRCode =
    referralCode &&
    (mission.required_artifact_type === ARTIFACT_TYPES.POSTING.key ||
      mission.required_artifact_type === ARTIFACT_TYPES.IMAGE.key ||
      mission.required_artifact_type ===
        ARTIFACT_TYPES.IMAGE_WITH_GEOLOCATION.key);

  const qrCodeValue = shouldShowQRCode
    ? `${window.location.origin}/missions/${missionId}?ref=${referralCode}`
    : "";

  return (
    <div className="space-y-6">
      {shouldShowQRCode && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">QRコード</h3>
            <p className="text-sm text-muted-foreground mb-4">
              このQRコードをスキャンして、ミッションページにアクセスできます
            </p>
          </div>
          <QRCodeDisplay value={qrCodeValue} />
          {referralCode && (
            <CopyReferralButton
              referralUrl={`${window.location.origin}/missions/${missionId}?ref=${referralCode}`}
            />
          )}
        </div>
      )}

      {!hasReachedUserMaxAchievements && (
        <>
          <MissionGuidanceArrow />
          <MissionFormWrapper
            mission={mission}
            authUser={authUser}
            userAchievementCount={userAchievementCount}
            onSubmissionSuccess={refreshSubmissions}
            preloadedQuizQuestions={preloadedQuizQuestions}
            mainLink={mainLink}
          />
        </>
      )}

      <SubmissionHistoryWrapper
        submissions={submissions}
        missionId={missionId}
        userId={authUser.id}
        maxAchievementCount={mission.max_achievement_count || 0}
      />
    </div>
  );
}
