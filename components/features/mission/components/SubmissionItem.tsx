"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { dateTimeFormatter } from "@/lib/formatter";
import type { SubmissionData } from "@/lib/types/domain";
import type React from "react";
import ArtifactDisplay from "./ArtifactDisplay";

interface SubmissionItemProps {
  submission: SubmissionData;
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
  const canCancel = userId === submission.user_id && isLatest;

  return (
    <Card className={isLatest ? "border-green-200 bg-green-50" : ""}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="text-sm text-muted-foreground">
            {dateTimeFormatter(new Date(submission.created_at))}
            {isLatest && (
              <span className="ml-2 text-green-600 font-medium">最新</span>
            )}
          </div>
          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCancelClick(submission.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              削除
            </Button>
          )}
        </div>
        {submission.artifact && (
          <ArtifactDisplay artifact={submission.artifact} />
        )}
      </CardContent>
    </Card>
  );
};

export default SubmissionItem;
