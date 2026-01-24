"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { unlinkTikTokAccountAction } from "../actions/tiktok-auth-actions";
import { linkTikTokAccount } from "../services/tiktok-auth";

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

function TikTokIcon({ className }: { className?: string }) {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}
