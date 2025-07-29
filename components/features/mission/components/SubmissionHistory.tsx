"use client";

import type { SubmissionData } from "@/lib/types/domain";
import type React from "react";
import { useState } from "react";
import CancelSubmissionDialog from "../dialogs/CancelSubmissionDialog";
import { useSubmissionCancel } from "../hooks/useSubmissionCancel";
import SubmissionItem from "./SubmissionItem";

interface SubmissionHistoryProps {
  submissions: SubmissionData[];
  missionId: string;
  userId?: string | null;
  maxAchievementCount: number;
}

const SubmissionHistory: React.FC<SubmissionHistoryProps> = ({
  submissions,
  missionId,
  userId,
  maxAchievementCount,
}) => {
  const {
    isDialogOpen,
    selectedSubmissionId,
    isLoading,
    handleDialogOpen,
    handleConfirmCancel,
    handleDialogClose,
  } = useSubmissionCancel(missionId);

  if (submissions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">達成履歴</h3>
      <div className="space-y-3">
        {submissions.map((submission, index) => (
          <SubmissionItem
            key={submission.id}
            submission={submission}
            isLatest={index === 0}
            userId={userId}
            onCancelClick={handleDialogOpen}
          />
        ))}
      </div>

      <CancelSubmissionDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onConfirm={handleConfirmCancel}
        isLoading={isLoading}
      />
    </div>
  );
};

export default SubmissionHistory;
