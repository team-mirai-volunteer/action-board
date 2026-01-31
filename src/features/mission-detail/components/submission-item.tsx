"use client";

import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ArtifactDisplay from "@/features/mission-detail/components/artifact-display";
import type { Submission } from "@/features/mission-detail/types/component-types";
import { dateTimeFormatter } from "@/lib/utils/date-formatters";

interface SubmissionItemProps {
  submission: Submission;
  isLatest: boolean;
  userId?: string | null;
  onCancelClick: (submissionId: string) => void;
}

const SubmissionItem: React.FC<SubmissionItemProps> = ({
  submission,
  isLatest,
  userId,
  onCancelClick,
}) => {
  const canCancel = userId && submission.user_id === userId;

  return (
    <li className="border p-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          提出日時: {dateTimeFormatter(new Date(submission.created_at))}
          {isLatest && (
            <Badge variant="outline" className="mx-4">
              最新
            </Badge>
          )}
        </div>
        {canCancel && (
          <Button
            variant="outline"
            size="xs"
            onClick={() => onCancelClick(submission.id)}
          >
            取り消す
          </Button>
        )}
      </div>
      <div>
        {submission.artifacts.map((artifact) => (
          <div className="mt-2" key={artifact.id}>
            <ArtifactDisplay key={artifact.id} artifact={artifact} />
          </div>
        ))}
      </div>
    </li>
  );
};

export default SubmissionItem;
