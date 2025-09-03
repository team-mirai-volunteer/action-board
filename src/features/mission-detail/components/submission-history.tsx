"use client";

import CancelSubmissionDialog from "@/features/mission-detail/components/cancel-submission-dialog";
import SubmissionItem from "@/features/mission-detail/components/submission-item";
import { useSubmissionCancel } from "@/features/mission-detail/hooks/use-submission-cancel";
import type { Submission } from "@/features/mission-detail/types/component-types";
import type React from "react";
import { useState } from "react";

interface SubmissionHistoryProps {
  submissions: Submission[];
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
    isLoading,
    handleCancelClick,
    handleCancelConfirm,
    handleDialogClose,
  } = useSubmissionCancel(missionId);

  // 1つ以上の履歴が存在する場合のみ表示
  if (submissions.length === 0) {
    return null;
  }

  // 提出日時でソートして最新の提出を取得
  const sortedSubmissions = [...submissions].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  // 5件ずつ表示するためのstate
  const [showAll, setShowAll] = useState(false);

  const displayedSubmissions = showAll
    ? sortedSubmissions
    : sortedSubmissions.slice(0, 5);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">あなたの達成履歴</h2>
      <ul className="space-y-4">
        {displayedSubmissions.map((submission, index) => (
          <SubmissionItem
            key={submission.id}
            submission={submission}
            isLatest={index === 0}
            userId={userId}
            onCancelClick={handleCancelClick}
          />
        ))}
      </ul>

      {!showAll && sortedSubmissions.length > 5 && (
        <div className="flex justify-center mt-4">
          <button
            className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200"
            onClick={() => setShowAll(true)}
            type="button"
            data-testid="show-all-achievement"
          >
            すべて見る
          </button>
        </div>
      )}

      <CancelSubmissionDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onConfirm={handleCancelConfirm}
        isLoading={isLoading}
      />
    </div>
  );
};

export default SubmissionHistory;
