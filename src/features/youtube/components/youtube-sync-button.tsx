"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
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
  const [showLongLoadingMessage, setShowLongLoadingMessage] = useState(false);

  // 3秒以上経過したらメッセージを表示
  useEffect(() => {
    if (!isLoading) {
      setShowLongLoadingMessage(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowLongLoadingMessage(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleSync = async () => {
    setIsLoading(true);
    try {
      // 1. チームみらいタグ付き動画を同期（1時間のレート制限付き）
      const { syncTeamMiraiVideosAction } = await import(
        "../actions/youtube-video-actions"
      );
      const teamMiraiResult = await syncTeamMiraiVideosAction();

      // 2. 自分のアップロード動画を同期（レート制限なし）
      const videoSyncResult = await syncMyYouTubeVideosAction();

      // 3. いいね・コメントを同期＆ミッションクリア
      const syncResult = await syncAllYouTubeDataAction();

      // 結果メッセージを構築
      const messages: string[] = [];

      // チームみらい動画の同期結果
      if (teamMiraiResult.success && !teamMiraiResult.skipped) {
        if (teamMiraiResult.newVideos && teamMiraiResult.newVideos > 0) {
          messages.push(
            `${teamMiraiResult.newVideos}件のチームみらい動画を追加しました`,
          );
        }
      }

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
        (teamMiraiResult.newVideos || 0) +
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
    <div className="flex flex-col items-end gap-1">
      <Button
        onClick={handleSync}
        disabled={isLoading || disabled}
        variant="outline"
        className="gap-2"
      >
        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        {isLoading ? "同期中..." : "動画を同期"}
      </Button>
      {showLongLoadingMessage && (
        <p className="text-xs text-gray-500">
          処理に20秒程度かかる場合があります
        </p>
      )}
    </div>
  );
}
