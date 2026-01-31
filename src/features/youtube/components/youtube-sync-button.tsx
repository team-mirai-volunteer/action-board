"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { syncYouTubeLikesAction } from "../actions/youtube-like-actions";
import { syncMyYouTubeVideosAction } from "../actions/youtube-video-actions";

interface YouTubeSyncButtonProps {
  onSyncComplete?: (syncedCount: number) => void;
  disabled?: boolean;
}

export function YouTubeSyncButton({
  onSyncComplete,
  disabled,
}: YouTubeSyncButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSync = async () => {
    setIsLoading(true);
    try {
      // 1. アップロード動画を同期
      const videoSyncResult = await syncMyYouTubeVideosAction();

      // 2. いいね動画を同期＆ミッションクリア
      const likeSyncResult = await syncYouTubeLikesAction();

      // 結果メッセージを構築
      const messages: string[] = [];

      if (videoSyncResult.success) {
        if (videoSyncResult.syncedCount && videoSyncResult.syncedCount > 0) {
          messages.push(
            `${videoSyncResult.syncedCount}件のアップロード動画を同期しました`,
          );
        }
      } else {
        toast.error(videoSyncResult.error || "アップロード動画同期に失敗");
      }

      if (likeSyncResult.success) {
        if (likeSyncResult.syncedVideoCount > 0) {
          messages.push(
            `${likeSyncResult.syncedVideoCount}件のいいね動画を追加しました`,
          );
        }
        if (likeSyncResult.achievedCount > 0) {
          messages.push(`(+${likeSyncResult.totalXpGranted} XP)`);
        }
      } else if (likeSyncResult.error) {
        toast.error(likeSyncResult.error);
      }

      // 成功メッセージをtoastで表示
      if (messages.length > 0) {
        toast.success("同期完了", {
          description: (
            <div className="flex flex-col">
              {messages.map((msg) => (
                <span key={msg}>{msg}</span>
              ))}
            </div>
          ),
          duration: 8000,
        });
      } else if (videoSyncResult.success && likeSyncResult.success) {
        toast.info("新しい動画はありませんでした");
      }

      // 何かしら同期されたらコールバック
      const totalSynced =
        (videoSyncResult.syncedCount || 0) +
        likeSyncResult.syncedVideoCount +
        likeSyncResult.achievedCount;
      onSyncComplete?.(totalSynced);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "同期中にエラーが発生しました",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={isLoading || disabled}
      variant="outline"
      className="gap-2"
    >
      <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
      {isLoading ? "同期中..." : "動画を同期"}
    </Button>
  );
}
