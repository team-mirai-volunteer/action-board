"use client";

import { useState } from "react";
import { cancelSubmissionAction } from "../actions";

export const useSubmissionCancel = (missionId: string) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCancelClick = (submissionId: string) => {
    setSelectedSubmissionId(submissionId);
    setIsDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedSubmissionId) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("achievementId", selectedSubmissionId);
      formData.append("missionId", missionId);

      const result = await cancelSubmissionAction(formData);

      if (result.success) {
        // 成功時はページをリロードして最新の状態を反映
        window.location.reload();
      } else {
        // エラー時はアラートを表示
        alert(result.error || "キャンセル処理に失敗しました。");
      }
    } catch (error) {
      console.error("キャンセル処理でエラーが発生しました:", error);
      alert("キャンセル処理に失敗しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
      setSelectedSubmissionId("");
    }
  };

  const handleDialogClose = () => {
    if (!isLoading) {
      setIsDialogOpen(false);
      setSelectedSubmissionId("");
    }
  };

  return {
    isDialogOpen,
    isLoading,
    handleCancelClick,
    handleCancelConfirm,
    handleDialogClose,
  };
};
