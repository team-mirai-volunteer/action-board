"use client";

import { footerConfig } from "@/config/footer";
import { copyToClipboard, getCurrentUrl } from "@/lib/utils/browser";
import type { User } from "@supabase/supabase-js";
import { useCallback } from "react";

interface UseFooterSocialShareReturn {
  handleLineShare: () => void;
  handleTwitterShare: () => void;
  handleFacebookShare: () => void;
  handleCopyUrl: () => Promise<void>;
}

export function useFooterSocialShare(
  user: User | null,
): UseFooterSocialShareReturn {
  const { socialShare } = footerConfig;

  const getShareUrl = useCallback(() => {
    const currentUrl = getCurrentUrl();
    if (user?.id) {
      const url = new URL(currentUrl);
      url.searchParams.set("ref", user.id);
      return url.toString();
    }
    return currentUrl;
  }, [user?.id]);

  const handleLineShare = useCallback(() => {
    const url = getShareUrl();
    const text = encodeURIComponent(socialShare.messages.line);
    const shareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
      url,
    )}&text=${text}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  }, [getShareUrl, socialShare.messages.line]);

  const handleTwitterShare = useCallback(() => {
    const url = getShareUrl();
    const text = encodeURIComponent(socialShare.messages.twitter);
    const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(
      url,
    )}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  }, [getShareUrl, socialShare.messages.twitter]);

  const handleFacebookShare = useCallback(() => {
    const url = getShareUrl();
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      url,
    )}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  }, [getShareUrl]);

  const handleCopyUrl = useCallback(async () => {
    const url = getShareUrl();
    try {
      await copyToClipboard(url);
    } catch (error) {
      console.error("Failed to copy URL:", error);
    }
  }, [getShareUrl]);

  return {
    handleLineShare,
    handleTwitterShare,
    handleFacebookShare,
    handleCopyUrl,
  };
}
