"use client";

import { cancelSubmissionAction } from "@/app/missions/[id]/actions";
import { useState } from "react";

export const useSubmissionCancel = (missionId: string) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDialogOpen = (submissionId: string) => {
    setSelectedSubmissionId(submissionId);
    setIsDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedSubmissionId) return;

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("submissionId", selectedSubmissionId);
      const result = await cancelSubmissionAction(formData);

      if (result.success) {
        window.location.reload();
      } else {
        alert(result.error || "削除に失敗しました");
      }
    } catch (error) {
      console.error("Cancel submission error:", error);
      alert("削除中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedSubmissionId(null);
  };

  return {
    isDialogOpen,
    selectedSubmissionId,
    isLoading,
    handleDialogOpen,
    handleConfirmCancel,
    handleDialogClose,
  };
};
