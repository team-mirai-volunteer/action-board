"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { syncMyTikTokVideosAction } from "../actions/tiktok-video-actions";

interface TikTokSyncButtonProps {
  onSyncComplete?: (syncedCount: number) => void;
  disabled?: boolean;
}

export function TikTokSyncButton({
  onSyncComplete,
  disabled,
}: TikTokSyncButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSync = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      const syncResult = await syncMyTikTokVideosAction();
      if (syncResult.success) {
        const message =
          syncResult.syncedCount && syncResult.syncedCount > 0
            ? `${syncResult.syncedCount}件の動画を同期しました`
            : "新しい #チームみらい 動画はありませんでした";
        setResult({ success: true, message });
        onSyncComplete?.(syncResult.syncedCount || 0);
      } else {
        setResult({
          success: false,
          message: syncResult.error || "同期に失敗しました",
        });
      }
    } catch (err) {
      setResult({
        success: false,
        message:
          err instanceof Error ? err.message : "同期中にエラーが発生しました",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleSync}
        disabled={isLoading || disabled}
        variant="outline"
        className="gap-2"
      >
        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        {isLoading ? "同期中..." : "動画を同期"}
      </Button>
      {result && (
        <p
          className={`text-sm ${result.success ? "text-green-600" : "text-red-600"}`}
        >
          {result.message}
        </p>
      )}
    </div>
  );
}
