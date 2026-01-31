"use client";

import { CheckCircle, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getYouTubeLinkStatusAction } from "@/features/youtube/actions/youtube-video-actions";
import { YouTubeIcon } from "@/features/youtube/components";
import type { YouTubeLinkStatus } from "@/features/youtube/types";

// 手動入力セクション
function ManualInputSection({ disabled }: { disabled: boolean }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="artifactLink">
        YouTubeコメントURL <span className="text-red-500">*</span>
      </Label>
      <Input
        type="url"
        name="artifactLink"
        id="artifactLink"
        placeholder="https://www.youtube.com/watch?v=...&lc=..."
        disabled={disabled}
        required
      />
      <p className="text-xs text-gray-500">
        コメントしたYouTube動画のURLを入力してください（コメントIDを含むURLが望ましい）
      </p>
    </div>
  );
}

type YouTubeCommentFormProps = {
  disabled: boolean;
  missionId: string;
};

export function YouTubeCommentForm({
  disabled,
  missionId,
}: YouTubeCommentFormProps) {
  const [linkStatus, setLinkStatus] = useState<YouTubeLinkStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

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
            <p className="text-xs mt-1">
              チームみらい動画にコメントすると、定期的な同期処理で自動的に検出され、ミッション達成として記録されます。
            </p>
          </div>
        </div>

        <Link
          href="/settings/youtube?tab=comments"
          className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <YouTubeIcon className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-gray-900">
              コメントした動画を確認
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
        YouTubeアカウントを連携すると、チームみらい動画へのコメントが自動で検出され、ミッション達成として記録されます。
      </p>
      <Link
        href="/settings/youtube?tab=comments"
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
