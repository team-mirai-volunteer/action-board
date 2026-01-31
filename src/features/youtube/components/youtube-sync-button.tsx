"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { syncAllYouTubeDataAction } from "../actions/youtube-sync-actions";
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

      // 2. いいね・コメントを同期＆ミッションクリア
      const syncResult = await syncAllYouTubeDataAction();

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

      if (syncResult.success) {
        // いいね
        if (syncResult.likes.syncedVideoCount > 0) {
          messages.push(
            `${syncResult.likes.syncedVideoCount}件のいいね動画を追加しました`,
          );
        }
        // コメント（ユーザー自身のコメントでミッション達成した件数）
        if (syncResult.comments.achievedCount > 0) {
          messages.push(
            `${syncResult.comments.achievedCount}件のコメントを検出しました`,
          );
        }
        // XP獲得
        if (syncResult.totalXpGranted > 0) {
          messages.push(`+${syncResult.totalXpGranted} XP`);
        }
      } else if (syncResult.error) {
        toast.error(syncResult.error);
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
      } else if (videoSyncResult.success && syncResult.success) {
        toast.info("新しい動画はありませんでした");
      }

      // 何かしら同期されたらコールバック
      const totalSynced =
        (videoSyncResult.syncedCount || 0) +
        syncResult.likes.syncedVideoCount +
        syncResult.likes.achievedCount +
        syncResult.comments.achievedCount;
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
