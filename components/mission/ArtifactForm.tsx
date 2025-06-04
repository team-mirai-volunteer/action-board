"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ARTIFACT_TYPES, getArtifactConfig } from "@/lib/artifactTypes";
import type { Tables } from "@/lib/types/supabase";
import type { User } from "@supabase/supabase-js";
import { useState } from "react";
import { GeolocationInput } from "./GeolocationInput";
import { ImageUploader } from "./ImageUploader";

type ArtifactFormProps = {
  mission: Tables<"missions">;
  authUser: User | null;
  disabled: boolean;
  submittedArtifactImagePath: string | null;
};

type GeolocationData = {
  lat: number;
  lon: number;
  accuracy?: number;
  altitude?: number;
};

export function ArtifactForm({
  mission,
  authUser,
  disabled,
  submittedArtifactImagePath,
}: ArtifactFormProps) {
  const [artifactImagePath, setArtifactImagePath] = useState<
    string | undefined
  >(undefined);
  const [geolocation, setGeolocation] = useState<GeolocationData | null>(null);

  const artifactConfig = mission
    ? getArtifactConfig(mission.required_artifact_type)
    : undefined;

  if (!artifactConfig || artifactConfig.key === ARTIFACT_TYPES.NONE.key) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">達成報告フォーム</CardTitle>
        <p className="text-sm text-muted-foreground">
          ミッションを完了したら、達成報告しましょう！
        </p>
        <p className="text-sm text-muted-foreground">
          ※ フォームの内容は他の人に公開されることはありません。
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* リンク入力フォーム */}
        {artifactConfig.key === ARTIFACT_TYPES.LINK.key && (
          <div className="space-y-2">
            <Label htmlFor="artifactLink">{mission.artifact_label}</Label>
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
            <Label htmlFor="artifactText">{mission.artifact_label}</Label>
            <Input
              name="artifactText"
              id="artifactText"
              placeholder={`${mission.artifact_label}を入力してください`}
              disabled={disabled}
              required
            />
          </div>
        )}

        {/* 画像アップロードフォーム */}
        {(artifactConfig.key === ARTIFACT_TYPES.IMAGE.key ||
          artifactConfig.key === ARTIFACT_TYPES.IMAGE_WITH_GEOLOCATION.key) && (
          <div className="space-y-4">
            <ImageUploader
              mission={mission}
              authUser={authUser}
              disabled={disabled}
              onImagePathChange={setArtifactImagePath}
              allowedMimeTypes={
                artifactConfig.allowedMimeTypes
                  ? [...artifactConfig.allowedMimeTypes]
                  : undefined
              }
              maxFileSizeMB={artifactConfig.maxFileSizeMB}
            />
            <Input
              type="hidden"
              name="artifactImagePath"
              value={artifactImagePath || ""}
            />

            {/* 提出済みタスク時のプレビュー表示 */}
            {submittedArtifactImagePath && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">提出済み画像:</p>
                <img
                  src={submittedArtifactImagePath}
                  alt="提出済み画像"
                  className="w-24 h-24 object-cover rounded border"
                />
              </div>
            )}

            {/* 位置情報入力 */}
            {artifactConfig.key ===
              ARTIFACT_TYPES.IMAGE_WITH_GEOLOCATION.key && (
              <>
                <GeolocationInput
                  disabled={disabled}
                  onGeolocationChange={setGeolocation}
                />
                {/* 位置情報用の隠しフィールド */}
                {geolocation && (
                  <>
                    <Input
                      type="hidden"
                      name="latitude"
                      value={geolocation.lat}
                    />
                    <Input
                      type="hidden"
                      name="longitude"
                      value={geolocation.lon}
                    />
                    {geolocation.accuracy ? (
                      <Input
                        type="hidden"
                        name="accuracy"
                        value={geolocation.accuracy}
                      />
                    ) : (
                      ""
                    )}
                    {geolocation.altitude ? (
                      <Input
                        type="hidden"
                        name="altitude"
                        value={geolocation.altitude}
                      />
                    ) : (
                      ""
                    )}
                  </>
                )}
              </>
            )}
          </div>
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
