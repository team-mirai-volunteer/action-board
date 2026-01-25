"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { unlinkYouTubeAccountAction } from "../actions/youtube-auth-actions";
import { linkYouTubeAccount } from "../services/youtube-auth";

// Google "G" ロゴ（公式カラー版）
function GoogleIcon({ className }: { className?: string }) {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

interface YouTubeLinkButtonProps {
  isLinked: boolean;
  channelTitle?: string;
  thumbnailUrl?: string;
  returnUrl?: string;
  onUnlink?: () => void;
}

export function YouTubeLinkButton({
  isLinked,
  channelTitle,
  thumbnailUrl,
  returnUrl,
  onUnlink,
}: YouTubeLinkButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLink = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await linkYouTubeAccount(returnUrl);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "YouTube連携に失敗しました",
      );
      setIsLoading(false);
    }
  };

  const handleUnlink = async () => {
    if (!confirm("YouTube連携を解除しますか？")) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await unlinkYouTubeAccountAction();
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
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt={channelTitle || "YouTube"}
              className="w-10 h-10 rounded-full"
            />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {channelTitle || "YouTubeチャンネル"}
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
      {/* Google Branding Guidelines準拠ボタン */}
      <button
        type="button"
        onClick={handleLink}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white border border-[#747775] rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        style={{ fontFamily: "Roboto, sans-serif" }}
      >
        {isLoading ? (
          <span className="text-[#1F1F1F] text-sm font-medium">処理中...</span>
        ) : (
          <>
            <GoogleIcon className="w-5 h-5 flex-shrink-0" />
            <span className="text-[#1F1F1F] text-sm font-medium">
              Googleアカウントで連携
            </span>
          </>
        )}
      </button>
    </div>
  );
}
