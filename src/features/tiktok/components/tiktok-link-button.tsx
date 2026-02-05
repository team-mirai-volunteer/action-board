"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { unlinkTikTokAccountAction } from "../actions/tiktok-auth-actions";
import { linkTikTokAccount } from "../services/tiktok-auth";
import { TikTokIcon } from "./tiktok-icon";

interface TikTokLinkButtonProps {
  isLinked: boolean;
  tiktokDisplayName?: string;
  tiktokAvatarUrl?: string;
  returnUrl?: string;
  onUnlink?: () => void;
}

export function TikTokLinkButton({
  isLinked,
  tiktokDisplayName,
  tiktokAvatarUrl,
  returnUrl,
  onUnlink,
}: TikTokLinkButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLink = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await linkTikTokAccount(returnUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "TikTok連携に失敗しました");
      setIsLoading(false);
    }
  };

  const handleUnlink = async () => {
    if (!confirm("TikTok連携を解除しますか？")) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await unlinkTikTokAccountAction();
      if (result.success) {
        onUnlink?.();
      } else {
        setError(result.error || "連携解除に失敗しました");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "連携解除に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLinked) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          {tiktokAvatarUrl && (
            // biome-ignore lint/performance/noImgElement: TikTokの外部アバターURLのためnext/imageは使用不可
            <img
              src={tiktokAvatarUrl}
              alt={tiktokDisplayName || "TikTok"}
              className="w-10 h-10 rounded-full"
            />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {tiktokDisplayName || "TikTokアカウント"}
            </p>
            <p className="text-xs text-green-600">連携済み</p>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button
          variant="outline"
          onClick={handleUnlink}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "処理中..." : "連携を解除"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button
        onClick={handleLink}
        disabled={isLoading}
        className="w-full bg-black hover:bg-gray-800 text-white"
      >
        {isLoading ? (
          "処理中..."
        ) : (
          <span className="flex items-center gap-2">
            <TikTokIcon className="w-5 h-5" />
            TikTokアカウントを連携
          </span>
        )}
      </Button>
    </div>
  );
}
