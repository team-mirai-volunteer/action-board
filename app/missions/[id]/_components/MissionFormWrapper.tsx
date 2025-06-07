"use client";

import { LevelUpDialog } from "@/components/level-up-dialog";
import { ArtifactForm } from "@/components/mission/ArtifactForm";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { XpProgressToast } from "@/components/xp-progress-toast";
import { useXpProgressAnimation } from "@/hooks/useXpProgressAnimation";
import { ARTIFACT_TYPES } from "@/lib/artifactTypes";
import type { UserLevel } from "@/lib/services/userLevel";
import type { Tables } from "@/lib/types/supabase";
import type { User } from "@supabase/supabase-js";
import { AlertCircle } from "lucide-react";
import { useRef, useState } from "react";
import { useMissionSubmission } from "../_hooks/useMissionSubmission";
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

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [missionResult, setMissionResult] = useState<{
    success: boolean;
    xpGranted?: number;
    userLevel?: UserLevel;
    error?: string;
  } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const {
    isToastOpen,
    toastData,
    isLevelUpDialogOpen,
    levelUpData,
    startXpAnimation,
    handleLevelUp,
    checkLevelUp,
    handleLevelUpDialogClose,
    handleToastClose,
    handleAnimationComplete,
  } = useXpProgressAnimation();

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
        setMissionResult(result);
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

    if (
      missionResult?.success &&
      missionResult.xpGranted &&
      missionResult.userLevel
    ) {
      startXpAnimation(
        missionResult.userLevel as UserLevel,
        missionResult.xpGranted,
      );
    }

    // 達成履歴を更新
    if (onSubmissionSuccess) {
      onSubmissionSuccess();
    }
  };

  const completed =
    hasReachedUserMaxAchievements && mission?.max_achievement_count !== null;

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

        {completed && (
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

        <ArtifactForm
          key={formKey}
          mission={mission}
          authUser={authUser}
          disabled={isButtonDisabled || isSubmitting}
          submittedArtifactImagePath={null}
        />

        {!completed && (
          <>
            <SubmitButton
              pendingText="登録中..."
              size="lg"
              disabled={isButtonDisabled || isSubmitting}
            >
              {buttonLabel}
            </SubmitButton>
            <p className="text-sm text-muted-foreground">
              ※
              成果物の内容が認められない場合、ミッションの達成が取り消される場合があります。正確な内容をご記入ください。
            </p>
          </>
        )}
      </form>

      <MissionCompleteDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        mission={mission}
      />

      {toastData && (
        <XpProgressToast
          isOpen={isToastOpen}
          onOpenChange={handleToastClose}
          userLevel={toastData.userLevel}
          xpGranted={toastData.xpGranted}
          startLevel={toastData.startLevel}
          startLevelStartXp={toastData.startLevelStartXp}
          nextLevelRequiredXp={toastData.nextLevelRequiredXp}
          xpRangeForCurrentLevel={toastData.xpRangeForCurrentLevel}
          isMultiLevel={toastData.isMultiLevel}
          stages={toastData.stages}
          finalLevel={toastData.finalLevel}
          onLevelUp={checkLevelUp}
          onAnimationComplete={handleAnimationComplete}
        />
      )}

      {levelUpData && (
        <LevelUpDialog
          isOpen={isLevelUpDialogOpen}
          onClose={handleLevelUpDialogClose}
          newLevel={levelUpData.newLevel}
          pointsToNextLevel={levelUpData.pointsToNextLevel}
        />
      )}
    </>
  );
}
