import { getReferralUrlAction } from "@/app/actions";
import { getOrigin, getCurrentUrl } from "@/lib/utils/browser";
import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";

export function useFooterSocialShare(user: User | null) {
  const [referralUrl, setReferralUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      getReferralUrlAction()
        .then((result) => {
          if (result.success && result.referralUrl) {
            setReferralUrl(result.referralUrl);
          } else {
            setReferralUrl(`${getOrigin()}/sign-up`);
          }
        })
        .catch((error) => {
          console.error("Failed to fetch referral URL:", error);
          setReferralUrl(`${getOrigin()}/sign-up`);
        })
        .finally(() => setLoading(false));
    } else {
      setReferralUrl(`${getOrigin()}/sign-up`);
    }
  }, [user?.id]);

  const handleLineShare = useCallback(() => {
    const shareUrl = getCurrentUrl();
    const lineIntentUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`;
    window.open(lineIntentUrl, "_blank", "noopener,noreferrer");
  }, []);

  const handleTwitterShare = useCallback(() => {
    const fallbackUrl = `${getOrigin()}/sign-up`;
    const shareReferralUrl = referralUrl || fallbackUrl;

    const message = `チームみらいでは、楽しみながらチームみらいの活動を応援できる「アクションボード」を公開中です！
応援が楽しくなる、様々なランキングもあります。

👇1分でLINEまたはメールでかんたんに登録できます！
${shareReferralUrl}

ご登録よろしくお願いします！
#チームみらい`;
    const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
    window.open(twitterIntentUrl, "_blank", "noopener,noreferrer");
  }, [referralUrl]);

  const handleFacebookShare = useCallback(() => {
    const shareUrl = getCurrentUrl();
    const facebookIntentUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookIntentUrl, "_blank", "noopener,noreferrer");
  }, []);

  const handleCopyUrl = useCallback(async () => {
    const currentUrl = getCurrentUrl();
    try {
      await navigator.clipboard.writeText(currentUrl);
      console.log("URLをコピーしました");
    } catch (error) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = currentUrl;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        console.log("URLをコピーしました（フォールバック）");
      } catch (fallbackError) {
        console.error("URLのコピーに失敗:", fallbackError);
      }
    }
  }, []);

  return {
    handleLineShare,
    handleTwitterShare,
    handleFacebookShare,
    handleCopyUrl,
    loading,
  };
}
