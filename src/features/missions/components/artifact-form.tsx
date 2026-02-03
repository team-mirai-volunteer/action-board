"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ARTIFACT_TYPES, getArtifactConfig } from "@/lib/types/artifact-types";
import type { Tables } from "@/lib/types/supabase";
import { PosterForm } from "./poster-form";
import { PostingForm } from "./posting-form";
import { YouTubeCommentForm } from "./youtube-comment-form";
import { YouTubeForm } from "./youtube-form";

type ArtifactFormProps = {
  mission: Tables<"missions">;
  disabled: boolean;
};

type GeolocationData = {
  lat: number;
  lon: number;
  accuracy?: number;
  altitude?: number;
};

export function ArtifactForm({ mission, disabled }: ArtifactFormProps) {
  const [_artifactImagePath, _setArtifactImagePath] = useState<
    string | undefined
  >(undefined);
  const [_geolocation, _setGeolocation] = useState<GeolocationData | null>(
    null,
  );

  const artifactConfig = mission
    ? getArtifactConfig(mission.required_artifact_type)
    : undefined;

  if (!artifactConfig || artifactConfig.key === ARTIFACT_TYPES.NONE.key) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-center">
          ミッション完了を記録しよう
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          ミッションを完了したら、達成を記録しましょう！
        </p>
        {mission.required_artifact_type !== "POSTER" && (
          <p className="text-sm text-muted-foreground">
            ※ 入力した内容は、外部に公開されることはありません。
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* リンク入力フォーム */}
        {artifactConfig.key === ARTIFACT_TYPES.LINK.key && (
          <div className="space-y-2">
            <Label htmlFor="artifactLink">
              {mission.artifact_label}
              <span className="artifactText"> (必須)</span>
            </Label>
            <Input
              type="url"
              name="artifactLink"
              id="artifactLink"
              placeholder={`${mission.artifact_label}を入力してください`}
              disabled={disabled}
              required
            />
          </div>
        )}

        {/* テキスト入力フォーム */}
        {artifactConfig.key === ARTIFACT_TYPES.TEXT.key && (
          <div className="space-y-2">
            <Label htmlFor="artifactText">
              {mission.artifact_label}
              <span className="artifactText"> (必須)</span>
            </Label>
            <Input
              name="artifactText"
              id="artifactText"
              placeholder={`${mission.artifact_label}を入力してください`}
              disabled={disabled}
              required
            />
          </div>
        )}

        {/* メールアドレス入力フォーム */}
        {artifactConfig.key === ARTIFACT_TYPES.EMAIL.key && (
          <div className="space-y-2">
            <Label htmlFor="artifactEmail">
              {mission.artifact_label}
              <span className="artifactText"> (必須)</span>
            </Label>
            <Input
              type="email"
              name="artifactEmail"
              id="artifactEmail"
              placeholder={`${mission.artifact_label}を入力してください`}
              disabled={disabled}
              required
            />
          </div>
        )}

        {/* ポスティング入力フォーム */}
        {artifactConfig.key === ARTIFACT_TYPES.POSTING.key && (
          <PostingForm disabled={disabled} />
        )}

        {/* ポスター入力フォーム */}
        {artifactConfig.key === ARTIFACT_TYPES.POSTER.key && (
          <PosterForm disabled={disabled} />
        )}

        {/* YouTube入力フォーム */}
        {artifactConfig.key === ARTIFACT_TYPES.YOUTUBE.key && (
          <YouTubeForm disabled={disabled} />
        )}

        {/* YouTubeコメント入力フォーム */}
        {artifactConfig.key === ARTIFACT_TYPES.YOUTUBE_COMMENT.key && (
          <YouTubeCommentForm disabled={disabled} />
        )}

        {/* 補足説明テキストエリア */}
        <div className="space-y-2">
          <Label htmlFor="artifactDescription">補足説明 (任意)</Label>
          <Textarea
            name="artifactDescription"
            id="artifactDescription"
            placeholder="達成内容に関して補足説明があれば入力してください"
            rows={3}
            disabled={disabled}
          />
        </div>
      </CardContent>
    </Card>
  );
}
