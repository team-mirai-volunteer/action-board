"use client";

import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/types/supabase";
import type { User } from "@supabase/supabase-js";
import { useState } from "react";
import QRCode from "react-qr-code"; // 必要に応じてnpm install react-qr-code
import type { SubmissionData } from "../_lib/types";
import { CopyReferralButton } from "./CopyReferralButton";
import { MissionFormWrapper } from "./MissionFormWrapper";
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
        difficulty: number;
      }[]
    | null;
};

export function MissionWithSubmissionHistory({
  mission,
  authUser,
  referralCode,
  initialUserAchievementCount,
  initialSubmissions,
  missionId,
  preloadedQuizQuestions,
}: Props) {
  const [submissions, setSubmissions] =
    useState<SubmissionData[]>(initialSubmissions);
  const [userAchievementCount, setUserAchievementCount] = useState(
    initialUserAchievementCount,
  );

  const refreshSubmissions = async () => {
    try {
      const supabase = createClient();

      // ユーザーの達成履歴を取得
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

      // 達成回数を更新
      setUserAchievementCount(achievementsData?.length || 0);

      if (!achievementsData || achievementsData.length === 0) {
        setSubmissions([]);
        return;
      }

      // 各達成に対応する成果物を取得
      const submissionsWithArtifacts = await Promise.all(
        achievementsData.map(async (achievement) => {
          const { data: artifactsData, error: artifactsError } = await supabase
            .from("mission_artifacts")
            .select("*")
            .eq("achievement_id", achievement.id);

          if (artifactsError) {
            console.error("Artifacts fetch error:", artifactsError);
            return {
              ...achievement,
              artifacts: [],
            };
          }

          // 成果物に画像がある場合は署名付きURLを取得
          const artifactsWithSignedUrls = await Promise.all(
            (artifactsData || []).map(async (artifact) => {
              if (artifact.image_storage_path) {
                const { data: signedUrlData } = await supabase.storage
                  .from("mission_artifact_files")
                  .createSignedUrl(artifact.image_storage_path, 60, {
                    transform: {
                      width: 240,
                      height: 240,
                      resize: "contain",
                    },
                  });

                if (signedUrlData) {
                  return {
                    ...artifact,
                    image_storage_path: signedUrlData.signedUrl,
                  };
                }
              }
              return artifact;
            }),
          );

          // 位置情報を取得
          const artifactsWithGeolocations = await Promise.all(
            artifactsWithSignedUrls.map(async (artifact) => {
              if (artifact.artifact_type === "IMAGE_WITH_GEOLOCATION") {
                const { data: geolocationsData, error: geolocationsError } =
                  await supabase
                    .from("mission_artifact_geolocations")
                    .select("*")
                    .eq("mission_artifact_id", artifact.id);

                if (!geolocationsError && geolocationsData) {
                  return {
                    ...artifact,
                    geolocations: geolocationsData,
                  };
                }
              }
              return artifact;
            }),
          );

          return {
            ...achievement,
            artifacts: artifactsWithGeolocations,
          };
        }),
      );

      // null値をフィルタリングして型安全にする
      const validSubmissions = submissionsWithArtifacts.filter(
        (submission): submission is SubmissionData => {
          if (typeof submission !== "object" || submission === null) {
            return false;
          }
          const sub = submission as Record<string, unknown>;
          return (
            "mission_id" in sub &&
            "user_id" in sub &&
            sub.mission_id !== null &&
            sub.user_id !== null
          );
        },
      );

      setSubmissions(validSubmissions);
    } catch (error) {
      console.error("Failed to refresh submissions:", error);
    }
  };

  // クライアントサイドでのみwindow.location.originを使用
  const origin =
    process.env.NEXT_PUBLIC_APP_ORIGIN ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const signupUrl = `${origin}/sign-up?ref=${referralCode}`;

  return (
    <>
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
        />
      )}

      {submissions.length > 0 && (
        <SubmissionHistoryWrapper
          submissions={submissions}
          missionId={missionId}
          userId={authUser.id}
          maxAchievementCount={mission.max_achievement_count || 0}
        />
      )}
    </>
  );
}
