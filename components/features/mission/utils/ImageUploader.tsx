"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/types/supabase";
import type { User } from "@supabase/supabase-js";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

type ImageUploaderProps = {
  mission: Tables<"missions">;
  authUser: User | null;
  disabled: boolean;
  onImagePathChange: (path: string | undefined) => void;
  allowedMimeTypes?: string[];
  maxFileSizeMB?: number;
};

export function ImageUploader({
  mission,
  authUser,
  disabled,
  onImagePathChange,
  allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"],
  maxFileSizeMB = 10,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImagePath, setUploadedImagePath] = useState<
    string | undefined
  >(undefined);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !authUser) return;

    if (!allowedMimeTypes.includes(file.type)) {
      setError(
        `対応していないファイル形式です。${allowedMimeTypes.join(", ")}のみ対応しています。`,
      );
      return;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSizeMB) {
      setError(
        `ファイルサイズが大きすぎます。${maxFileSizeMB}MB以下のファイルを選択してください。`,
      );
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const supabase = createClient();
      const fileExt = file.name.split(".").pop();
      const fileName = `${authUser.id}/${mission.id}/${Date.now()}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from("mission-artifacts")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        setError("画像のアップロードに失敗しました");
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("mission-artifacts").getPublicUrl(data.path);

      setUploadedImagePath(publicUrl);
      onImagePathChange(publicUrl);
    } catch (error) {
      console.error("Image upload error:", error);
      setError("画像のアップロードに失敗しました");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImagePath(undefined);
    onImagePathChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="imageUpload">
        {mission.artifact_label}
        <span className="text-red-500"> (必須)</span>
      </Label>

      {!uploadedImagePath ? (
        <div className="space-y-2">
          <Input
            ref={fileInputRef}
            type="file"
            id="imageUpload"
            accept={allowedMimeTypes.join(",")}
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="w-full"
          >
            {isUploading ? (
              "アップロード中..."
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                画像を選択
              </>
            )}
          </Button>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <p className="text-xs text-muted-foreground">
            対応形式: {allowedMimeTypes.join(", ")} / 最大サイズ:{" "}
            {maxFileSizeMB}MB
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative inline-block">
            <Image
              src={uploadedImagePath}
              alt="アップロード済み画像"
              width={200}
              height={200}
              className="object-cover rounded border"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemoveImage}
              disabled={disabled}
              className="absolute top-2 right-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-green-600">画像がアップロードされました</p>
        </div>
      )}
    </div>
  );
}
