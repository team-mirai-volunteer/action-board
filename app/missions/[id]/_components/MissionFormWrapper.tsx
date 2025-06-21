"use client";

import { ArtifactForm } from "@/components/mission/ArtifactForm";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { XpProgressToastContent } from "@/components/xp-progress-toast-content";
import { ARTIFACT_TYPES } from "@/lib/artifactTypes";
import type { Tables } from "@/lib/types/supabase";
import type { User } from "@supabase/supabase-js";
import { AlertCircle } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  useDailyAttemptStatus,
  useMissionSubmission,
} from "../_hooks/useMissionSubmission";
import { achieveMissionAction } from "../actions";
import { MissionCompleteDialog } from "./MissionCompleteDialog";

type Props = {
  mission: Tables<"missions">;
  authUser: User;
  userAchievementCount: number;
  onSubmissionSuccess?: () => void;
};

export function MissionFormWrapper({
  mission,
  authUser,
  userAchievementCount,
  onSubmissionSuccess,
}: Props) {
  const { buttonLabel, isButtonDisabled, hasReachedUserMaxAchievements } =
    useMissionSubmission(mission, userAchievementCount);
  const dailyAttemptStatus = useDailyAttemptStatus(
    mission.id,
    authUser?.id || null,
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  // XPアニメーション関連の状態
  const [xpAnimationData, setXpAnimationData] = useState<{
    initialXp: number;
    xpGained: number;
  } | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await achieveMissionAction(formData);

      if (result.success) {
        // フォームをクリア
        formRef.current?.reset();
        // ArtifactFormのstateをクリアするためにkeyを更新
        setFormKey((prev) => prev + 1);

        // XPアニメーションデータを保存
        if (result.userLevel && result.xpGranted) {
          const initialXp = result.userLevel.xp - result.xpGranted;
          setXpAnimationData({
            initialXp,
            xpGained: result.xpGranted,
          });
        }

        // ダイアログを表示
        setIsDialogOpen(true);
      } else {
        // エラーメッセージを表示
        setErrorMessage(result.error || "エラーが発生しました");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setErrorMessage("予期しないエラーが発生しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);

    // XPアニメーションを開始
    if (xpAnimationData) {
      startXpAnimation();
    }

    // 達成履歴を更新
    if (onSubmissionSuccess) {
      onSubmissionSuccess();
    }
  };

  // XPアニメーション開始
  const startXpAnimation = () => {
    if (!xpAnimationData) return;

    toast.custom(
      (t) => (
        <XpProgressToastContent
          initialXp={xpAnimationData.initialXp}
          xpGained={xpAnimationData.xpGained}
          onAnimationComplete={() => {
            toast.dismiss(t);
            setXpAnimationData(null);
          }}
        />
      ),
      {
        duration: Number.POSITIVE_INFINITY,
        position: "bottom-center",
        className: "rounded-md",
      },
    );
  };

  const completed =
    hasReachedUserMaxAchievements && mission?.max_achievement_count !== null;

  const isCompletedForUnlimitedMission =
    userAchievementCount > 0 && mission.max_achievement_count === null;

  return (
    <>
      <form ref={formRef} action={handleSubmit} className="flex flex-col gap-4">
        <input type="hidden" name="missionId" value={mission.id} />
        <input
          type="hidden"
          name="requiredArtifactType"
          value={mission.required_artifact_type ?? ARTIFACT_TYPES.NONE.key}
        />

        {errorMessage && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{errorMessage}</span>
          </div>
        )}

        {!hasReachedUserMaxAchievements &&
          userAchievementCount > 0 &&
          mission?.max_achievement_count !== null && (
            <div className="rounded-lg border bg-muted/50 p-4 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                あなたの達成回数: {userAchievementCount} /{" "}
                {mission.max_achievement_count}回
              </p>
            </div>
          )}

        {!completed && (
          <>
            <ArtifactForm
              key={formKey}
              mission={mission}
              authUser={authUser}
              disabled={isButtonDisabled || isSubmitting}
              submittedArtifactImagePath={null}
            />
            <SubmitButton
              pendingText="登録中..."
              size="lg"
              disabled={
                isButtonDisabled ||
                isSubmitting ||
                dailyAttemptStatus.hasReachedLimit
              }
            >
              {dailyAttemptStatus.hasReachedLimit
                ? "本日の挑戦回数上限に達しました"
                : buttonLabel}
            </SubmitButton>
            {dailyAttemptStatus.dailyLimit !== null && (
              <p className="text-sm text-muted-foreground">
                今日の挑戦回数: {dailyAttemptStatus.currentAttempts}/
                {dailyAttemptStatus.dailyLimit}
                {dailyAttemptStatus.hasReachedLimit && " (上限に達しました)"}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              ※
              成果物の内容が認められない場合、ミッションの達成が取り消される場合があります。正確な内容をご記入ください。
            </p>
          </>
        )}

        {(completed || isCompletedForUnlimitedMission) && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
            <p className="text-sm font-medium text-gray-800">
              このミッションは達成済みです。
            </p>
            <Button
              onClick={(e) => {
                e.preventDefault();
                setIsDialogOpen(true);
              }}
              className="mt-2"
              variant="outline"
            >
              シェアする
            </Button>
          </div>
        )}
      </form>

      <MissionCompleteDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        mission={mission}
      />
    </>
  );
}
