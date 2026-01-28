"use client";

import { SubmitButton } from "@/components/common/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type DetectedLike,
  detectYouTubeLikesAction,
  recordYouTubeLikeAction,
  validateYouTubeUrlAction,
} from "@/features/youtube/actions/youtube-like-actions";
import { getYouTubeLinkStatusAction } from "@/features/youtube/actions/youtube-video-actions";
import type { YouTubeLinkStatus } from "@/features/youtube/types";
import { ARTIFACT_TYPES } from "@/lib/types/artifact-types";
import type { Tables } from "@/lib/types/supabase";
import { AlertCircle, CheckCircle, ExternalLink, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface YouTubeFormProps {
  mission: Tables<"missions">;
  onSuccess: (result: {
    xpGranted?: number;
    userLevel?: { xp: number };
  }) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export function YouTubeForm({
  mission,
  onSuccess,
  onError,
  disabled = false,
}: YouTubeFormProps) {
  const [linkStatus, setLinkStatus] = useState<YouTubeLinkStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedLikes, setDetectedLikes] = useState<DetectedLike[]>([]);
  const [isRecording, setIsRecording] = useState<string | null>(null);
  const [manualUrl, setManualUrl] = useState("");
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
  const [urlValidation, setUrlValidation] = useState<{
    valid: boolean;
    error?: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // YouTube連携状態を取得
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await getYouTubeLinkStatusAction();
        setLinkStatus(status);
      } catch (error) {
        console.error("Failed to fetch YouTube link status:", error);
      } finally {
        setIsLoadingStatus(false);
      }
    };
    fetchStatus();
  }, []);

  // いいねを検出
  const handleDetectLikes = useCallback(async () => {
    setIsDetecting(true);
    setDetectedLikes([]);
    try {
      const result = await detectYouTubeLikesAction();
      if (result.success && result.detectedLikes) {
        setDetectedLikes(result.detectedLikes);
        if (result.detectedLikes.length === 0) {
          onError("チームみらい動画へのいいねが見つかりませんでした");
        }
      } else {
        onError(result.error || "いいねの検出に失敗しました");
      }
    } catch (error) {
      console.error("Detect likes error:", error);
      onError("いいねの検出に失敗しました");
    } finally {
      setIsDetecting(false);
    }
  }, [onError]);

  // いいねを記録
  const handleRecordLike = async (like: DetectedLike) => {
    setIsRecording(like.videoId);
    try {
      const result = await recordYouTubeLikeAction(
        mission.id,
        like.videoId,
        like.videoUrl,
      );
      if (result.success) {
        // 記録済みとしてマーク
        setDetectedLikes((prev) =>
          prev.map((l) =>
            l.videoId === like.videoId ? { ...l, alreadyRecorded: true } : l,
          ),
        );
        onSuccess({ xpGranted: result.xpGranted });
      } else {
        onError(result.error || "記録に失敗しました");
      }
    } catch (error) {
      console.error("Record like error:", error);
      onError("記録に失敗しました");
    } finally {
      setIsRecording(null);
    }
  };

  // URL検証
  const handleUrlChange = async (url: string) => {
    setManualUrl(url);
    setUrlValidation(null);

    if (!url.trim()) {
      return;
    }

    // YouTubeのURLっぽい場合のみ検証
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      setIsValidatingUrl(true);
      try {
        const result = await validateYouTubeUrlAction(url);
        setUrlValidation(result);
      } catch (error) {
        console.error("URL validation error:", error);
      } finally {
        setIsValidatingUrl(false);
      }
    }
  };

  // 手動URL提出
  const handleManualSubmit = async (formData: FormData) => {
    if (!urlValidation?.valid) {
      onError("有効なYouTube URLを入力してください");
      return;
    }

    setIsSubmitting(true);
    try {
      // FormDataにmissionIdとartifactTypeを追加
      formData.set("missionId", mission.id);
      formData.set("requiredArtifactType", ARTIFACT_TYPES.YOUTUBE.key);

      const { achieveMissionAction } = await import(
        "@/features/mission-detail/actions/actions"
      );
      const result = await achieveMissionAction(formData);

      if (result.success) {
        setManualUrl("");
        setUrlValidation(null);
        onSuccess({
          xpGranted: result.xpGranted,
          userLevel: result.userLevel ?? undefined,
        });
      } else {
        onError(result.error || "提出に失敗しました");
      }
    } catch (error) {
      console.error("Manual submit error:", error);
      onError("提出に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingStatus) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* YouTube連携セクション */}
      {linkStatus?.isLinked ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">
                YouTube連携済み
              </p>
              <p className="text-xs text-green-600">
                {linkStatus.channelTitle}
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleDetectLikes}
            disabled={isDetecting || disabled}
            className="w-full"
            variant="outline"
          >
            {isDetecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                いいねを検出中...
              </>
            ) : (
              "いいねした動画を確認"
            )}
          </Button>

          {/* 検出されたいいね一覧 */}
          {detectedLikes.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium">
                検出されたチームみらい動画へのいいね:
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {detectedLikes.map((like) => (
                  <div
                    key={like.videoId}
                    className="flex items-center gap-3 p-2 border rounded-lg"
                  >
                    {like.thumbnailUrl && (
                      <Image
                        src={like.thumbnailUrl}
                        alt={like.title}
                        width={80}
                        height={45}
                        className="rounded object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {like.title}
                      </p>
                      <a
                        href={like.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        動画を見る
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleRecordLike(like)}
                      disabled={
                        like.alreadyRecorded ||
                        isRecording === like.videoId ||
                        disabled
                      }
                    >
                      {like.alreadyRecorded ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          記録済み
                        </>
                      ) : isRecording === like.videoId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "記録する"
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 bg-muted/50 border rounded-lg">
          <p className="text-sm text-muted-foreground mb-3">
            YouTubeアカウントを連携すると、いいねした動画を自動で検出できます。
          </p>
          <Link href="/settings/youtube">
            <Button variant="outline" size="sm">
              YouTube連携設定へ
            </Button>
          </Link>
        </div>
      )}

      {/* 手動入力セクション */}
      <div className="border-t pt-4">
        <p className="text-sm font-medium mb-3">または、URLを手動で入力</p>
        <form action={handleManualSubmit} className="space-y-3">
          <div>
            <Label htmlFor="artifactLink">YouTube動画URL</Label>
            <Input
              id="artifactLink"
              name="artifactLink"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={manualUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              disabled={disabled || isSubmitting}
            />
            {isValidatingUrl && (
              <p className="text-xs text-muted-foreground mt-1">
                URLを確認中...
              </p>
            )}
            {urlValidation && !urlValidation.valid && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {urlValidation.error}
              </p>
            )}
            {urlValidation?.valid && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                有効なYouTube URLです
              </p>
            )}
          </div>
          <SubmitButton
            pendingText="記録中..."
            disabled={disabled || !urlValidation?.valid || isSubmitting}
          >
            手動で記録する
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
