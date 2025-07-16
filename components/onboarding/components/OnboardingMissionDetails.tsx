import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MissionIcon } from "@/components/ui/mission-icon";
import { Textarea } from "@/components/ui/textarea";
import { ARTIFACT_TYPE, BUTTON_TEXT, STYLE_CLASSES } from "../constants";
import type { MockMission } from "../types";

interface OnboardingMissionDetailsProps {
  mission: MockMission;
  artifactText: string;
  artifactDescription: string;
  artifactLabel: string;
  isSubmissionCompleted: boolean;
  onSubmit: () => void;
  onArtifactTextChange: (text: string) => void;
  onArtifactDescriptionChange: (text: string) => void;
}

/**
 * オンボーディングミッション詳細コンポーネント
 * ミッション詳細と提出フォームを表示
 */
export const OnboardingMissionDetails: React.FC<
  OnboardingMissionDetailsProps
> = ({
  mission,
  artifactText,
  artifactDescription,
  artifactLabel,
  isSubmissionCompleted,
  onSubmit,
  onArtifactTextChange,
  onArtifactDescriptionChange,
}) => {
  return (
    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-16 w-[90vw] max-w-3xl z-20 pb-32">
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
                el.innerHTML = mission.content;
              }
            }}
          />

          {/* 提出フォーム - ミッションタイプに応じて表示 */}
          {mission.required_artifact_type === ARTIFACT_TYPE.TEXT && (
            <MissionSubmissionForm
              artifactLabel={artifactLabel}
              artifactText={artifactText}
              artifactDescription={artifactDescription}
              isSubmissionCompleted={isSubmissionCompleted}
              onSubmit={onSubmit}
              onArtifactTextChange={onArtifactTextChange}
              onArtifactDescriptionChange={onArtifactDescriptionChange}
            />
          )}

          {/* NONEタイプの場合 */}
          {mission.required_artifact_type === ARTIFACT_TYPE.NONE && (
            <MissionSubmissionButton
              isSubmissionCompleted={isSubmissionCompleted}
              onSubmit={onSubmit}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * ミッション提出フォームコンポーネント（TEXTタイプ用）
 */
const MissionSubmissionForm: React.FC<{
  artifactLabel: string;
  artifactText: string;
  artifactDescription: string;
  isSubmissionCompleted: boolean;
  onSubmit: () => void;
  onArtifactTextChange: (text: string) => void;
  onArtifactDescriptionChange: (text: string) => void;
}> = ({
  artifactLabel,
  artifactText,
  artifactDescription,
  isSubmissionCompleted,
  onSubmit,
  onArtifactTextChange,
  onArtifactDescriptionChange,
}) => (
  <Card className="mt-6">
    <CardHeader>
      <CardTitle className="text-lg text-center">
        ミッション完了を記録しよう
      </CardTitle>
      <p className="text-sm text-muted-foreground">
        ミッションを完了したら、達成を記録しましょう！
      </p>
      <p className="text-sm text-muted-foreground">
        ※ 入力した内容は、外部に公開されることはありません。
      </p>
    </CardHeader>
    <CardContent className="space-y-6">
      {/* テキスト入力フォーム */}
      <div className="space-y-2">
        <Label htmlFor="artifactText">
          {artifactLabel}
          <span className="text-red-500"> (必須)</span>
        </Label>
        <Input
          name="artifactText"
          id="artifactText"
          value={artifactText}
          onChange={(e) => onArtifactTextChange(e.target.value)}
          placeholder={`${artifactLabel}を入力してください`}
          disabled={false}
          required
        />
      </div>

      {/* 補足説明テキストエリア */}
      <div className="space-y-2">
        <Label htmlFor="artifactDescription">補足説明 (任意)</Label>
        <Textarea
          name="artifactDescription"
          id="artifactDescription"
          value={artifactDescription}
          onChange={(e) => onArtifactDescriptionChange(e.target.value)}
          placeholder="達成内容に関して補足説明があれば入力してください"
          rows={3}
          disabled={false}
        />
      </div>

      {/* 提出ボタン */}
      <Button
        className={STYLE_CLASSES.BUTTON_SUBMIT}
        onClick={onSubmit}
        disabled={isSubmissionCompleted || artifactText.trim() === ""}
      >
        {isSubmissionCompleted
          ? BUTTON_TEXT.SUBMISSION_COMPLETE
          : BUTTON_TEXT.CHALLENGE}
      </Button>
    </CardContent>
  </Card>
);

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
