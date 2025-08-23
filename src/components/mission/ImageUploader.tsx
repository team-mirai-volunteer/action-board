"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/types/supabase";
import type { User } from "@supabase/supabase-js";
import { useState } from "react";

type ImageUploaderProps = {
  mission: Tables<"missions">;
  authUser: User | null;
  disabled: boolean;
  onImagePathChange: (path: string | undefined) => void;
  allowedMimeTypes?: readonly string[];
  maxFileSizeMB?: number;
};

export function ImageUploader({
  mission,
  authUser,
  disabled,
  onImagePathChange,
  allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
  maxFileSizeMB = 10,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const supabaseBrowserClient = createClient();

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (
      !event.target.files ||
      event.target.files.length === 0 ||
      !authUser?.id ||
      !mission?.id
    ) {
      setUploadError(
        "ファイルが選択されていないか、ユーザーまたはミッション情報がありません。",
      );
      return;
    }
    const file = event.target.files[0];
    // プレビュー用URL生成
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    const fileName = `${authUser.id}/${mission.id}/${Date.now()}_${file.name}`;
    setUploading(true);
    setUploadError(null);

    const { data, error } = await supabaseBrowserClient.storage
      .from("mission_artifact_files")
      .upload(fileName, file);

    setUploading(false);
    if (error) {
      console.error("Upload error:", error);
      setUploadError(`アップロードに失敗しました: ${error.message}`);
      onImagePathChange(undefined);
    } else {
      console.log("Uploaded data:", data);
      onImagePathChange(data.path);
      setUploadError(null);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="artifactImage">
        画像ファイル
        <span className="text-sm artifactDescription"> (必須)</span>
      </Label>
      <Input
        type="file"
        id="artifactImage"
        accept={allowedMimeTypes?.join(",")}
        disabled={disabled || uploading}
        onChange={handleImageUpload}
        required
      />
      {uploading && <p className="text-xs text-blue-600">アップロード中...</p>}
      {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
      {/* プレビュー表示 */}
      {previewImageUrl && (
        <img
          src={previewImageUrl}
          alt="プレビュー"
          className="w-24 h-24 object-cover rounded border"
        />
      )}
      <p className="text-xs text-muted-foreground">
        最大ファイルサイズ: {maxFileSizeMB}MB
      </p>
    </div>
  );
}
