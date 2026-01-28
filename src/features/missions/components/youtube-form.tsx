"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AutoAchieveResult } from "@/features/youtube/actions/youtube-like-actions";
import { getYouTubeLinkStatusAction } from "@/features/youtube/actions/youtube-video-actions";
import { YouTubeIcon } from "@/features/youtube/components";
import type { YouTubeLinkStatus } from "@/features/youtube/types";
import { CheckCircle, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// 手動入力セクション
function ManualInputSection({ disabled }: { disabled: boolean }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="artifactLink">
        YouTube動画URL <span className="text-red-500">*</span>
      </Label>
      <Input
        type="url"
        name="artifactLink"
        id="artifactLink"
        placeholder="https://www.youtube.com/watch?v=..."
        disabled={disabled}
        required
      />
      <p className="text-xs text-gray-500">
        いいねしたYouTube動画のURLを入力してください
      </p>
    </div>
  );
}

type YouTubeFormProps = {
  disabled: boolean;
  missionId: string;
};

export function YouTubeForm({ disabled, missionId }: YouTubeFormProps) {
  const [linkStatus, setLinkStatus] = useState<YouTubeLinkStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isAutoAchieving, setIsAutoAchieving] = useState(false);
  const [autoAchieveResult, setAutoAchieveResult] =
    useState<AutoAchieveResult | null>(null);

  // useRefで自動達成の試行フラグを管理（再レンダリングでリセットされない）
  const hasAttemptedRef = useRef(false);

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

  // // 連携済みの場合は自動達成を実行（一度だけ）
  // // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  // useEffect(() => {
  //   if (
  //     linkStatus?.isLinked &&
  //     !isLoadingStatus &&
  //     !disabled &&
  //     !hasAttemptedRef.current
  //   ) {
  //     hasAttemptedRef.current = true;

  //     const runAutoAchieve = async () => {
  //       setIsAutoAchieving(true);
  //       try {
  //         const result = await autoAchieveYouTubeMissionAction(missionId);
  //         setAutoAchieveResult(result);
  //       } catch (error) {
  //         console.error("Auto achieve error:", error);
  //         setAutoAchieveResult({
  //           success: false,
  //           achievedCount: 0,
  //           totalXpGranted: 0,
  //           error: "自動達成に失敗しました",
  //         });
  //       } finally {
  //         setIsAutoAchieving(false);
  //       }
  //     };

  //     runAutoAchieve();
  //   }
  // }, []);

  if (isLoadingStatus) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // YouTube連携済みの場合
  if (linkStatus?.isLinked) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">
              YouTube連携済み
            </p>
            <p className="text-xs text-green-600">{linkStatus.channelTitle}</p>
          </div>
        </div>

        {isAutoAchieving && (
          <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <p className="text-sm text-blue-800">いいねした動画を検出中...</p>
          </div>
        )}

        {autoAchieveResult && !isAutoAchieving && (
          <div
            className={`p-4 rounded-lg ${
              autoAchieveResult.error
                ? "bg-red-50 border border-red-200"
                : autoAchieveResult.achievedCount > 0
                  ? "bg-green-50 border border-green-200"
                  : "bg-gray-50 border border-gray-200"
            }`}
          >
            {autoAchieveResult.error ? (
              <p className="text-sm text-red-800">{autoAchieveResult.error}</p>
            ) : autoAchieveResult.achievedCount > 0 ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-800">
                  {autoAchieveResult.achievedCount}件のいいねを記録しました！ (+
                  {autoAchieveResult.totalXpGranted} XP)
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-700">
                新しいチームみらい動画へのいいねは見つかりませんでした。
                <br />
                <span className="text-xs text-gray-500">
                  YouTubeでチームみらいの動画にいいねをしてから、このページを再読み込みしてください。
                </span>
              </p>
            )}
          </div>
        )}

        <Link
          href="/settings/youtube"
          className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <YouTubeIcon className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-gray-900">
              いいねした動画を確認
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>

        <div className="border-t pt-4 mt-4">
          <p className="text-sm text-gray-600 mb-3">
            自動検出で見つからない場合は、YouTube動画のURLを手動で入力してください。
          </p>
          <ManualInputSection disabled={disabled} />
        </div>
      </div>
    );
  }

  // YouTube未連携の場合
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        YouTubeアカウントを連携すると、チームみらい動画へのいいねが自動で検出され、ミッション達成として記録されます。
      </p>
      <Link
        href="/settings/youtube"
        className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <YouTubeIcon className="w-5 h-5 text-red-600" />
          <span className="text-sm font-medium text-gray-900">YouTube連携</span>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </Link>

      <div className="border-t pt-4 mt-4">
        <p className="text-sm text-gray-600 mb-3">
          YouTube連携なしでも、動画URLを入力して記録できます。
        </p>
        <ManualInputSection disabled={disabled} />
      </div>
    </div>
  );
}
