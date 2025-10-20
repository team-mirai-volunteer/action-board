import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DifficultyBadge } from "@/features/missions/components/difficulty-badge";
import { MissionIcon } from "@/features/missions/components/mission-icon";
import type { MockMission } from "@/features/onboarding/types/types";
import { BUTTON_TEXT, STYLE_CLASSES } from "../constants/constants";
import { sanitizeHtml } from "../utils/utils";

interface OnboardingMissionDetailsProps {
  mission: MockMission;
  isSubmissionCompleted: boolean;
  onSubmit: () => void;
}

/**
 * オンボーディングミッション詳細コンポーネント
 * ミッション詳細と提出フォームを表示
 */
export const OnboardingMissionDetails: React.FC<
  OnboardingMissionDetailsProps
> = ({ mission, isSubmissionCompleted, onSubmit }) => {
  return (
    <div className="mt-[80vh] w-[90vw] max-w-lg mx-auto z-20 pb-32">
      <Card data-mission-detail-card>
        <CardHeader>
          <div className="flex items-start gap-4">
            {mission.icon_url && (
              <MissionIcon
                src={mission.icon_url}
                alt={mission.title}
                size="lg"
              />
            )}
            <div className="flex-1 space-y-2">
              <CardTitle className="text-xl">{mission.title}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <DifficultyBadge difficulty={mission.difficulty} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className="text-muted-foreground leading-relaxed whitespace-pre-wrap mission-content"
            ref={(el) => {
              if (el && mission.content) {
                el.innerHTML = sanitizeHtml(mission.content);
              }
            }}
          />

          {/* 提出フォーム - NONEタイプ（期日前投票専用） */}
          <MissionSubmissionButton
            isSubmissionCompleted={isSubmissionCompleted}
            onSubmit={onSubmit}
          />
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * ミッション提出ボタンコンポーネント（NONEタイプ用）
 */
const MissionSubmissionButton: React.FC<{
  isSubmissionCompleted: boolean;
  onSubmit: () => void;
}> = ({ isSubmissionCompleted, onSubmit }) => (
  <Card className="mt-6">
    <CardHeader>
      <CardTitle className="text-lg text-center">
        ミッションにチャレンジしよう
      </CardTitle>
      <p className="text-sm text-muted-foreground">
        下のボタンをクリックすると、自動的にミッションが完了します！
      </p>
    </CardHeader>
    <CardContent>
      <Button
        className={STYLE_CLASSES.BUTTON_SUBMIT}
        onClick={onSubmit}
        disabled={isSubmissionCompleted}
      >
        {isSubmissionCompleted
          ? BUTTON_TEXT.MISSION_COMPLETE
          : BUTTON_TEXT.RECORD}
      </Button>
      {isSubmissionCompleted && (
        <div className="mt-4 text-center">
          <p className="text-green-600 font-medium">ミッション完了！</p>
        </div>
      )}
    </CardContent>
  </Card>
);
