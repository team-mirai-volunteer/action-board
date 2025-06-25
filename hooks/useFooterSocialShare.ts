import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useState } from "react";

async function getReferralCodeClient(userId: string): Promise<string> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_referral")
    .select("referral_code")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Referral code fetch error:", error.message);
    throw new Error("紹介コードの取得に失敗しました");
  }

  if (data) {
    return data.referral_code;
  }

  const referralCode = nanoid(8);

  const { data: insertData, error: insertError } = await supabase
    .from("user_referral")
    .insert({
      user_id: userId,
      referral_code: referralCode,
    })
    .select()
    .single();

  if (insertError) {
    console.error("Referral code insert error:", insertError.message);
    throw new Error("紹介コードの作成に失敗しました");
  }
  return insertData.referral_code;
}

export function useFooterSocialShare(user: User | null) {
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      getReferralCodeClient(user.id)
        .then(setReferralCode)
        .catch((error) => {
          console.error("Failed to fetch referral code:", error);
          setReferralCode(null);
        });
    } else {
      setReferralCode(null);
    }
  }, [user?.id]);

  const handleLineShare = useCallback(() => {
    const shareUrl = window.location.href;
    const lineIntentUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`;
    window.open(lineIntentUrl, "_blank", "noopener,noreferrer");
  }, []);

  const handleTwitterShare = useCallback(() => {
    const shareUrl = window.location.href;
    const origin =
      process.env.NEXT_PUBLIC_APP_ORIGIN ||
      (typeof window !== "undefined" ? window.location.origin : "");
    const referralUrl = referralCode
      ? `${origin}/sign-up?ref=${referralCode}`
      : `${origin}/sign-up`;

    const message = `チームみらいでは、楽しみながらチームみらいの活動を応援できる「アクションボード」を公開中です！
応援が楽しくなる、様々なランキングもあります。

👇1分でLINEまたはメールでかんたんに登録できます！
${referralUrl}

ご登録よろしくお願いします！
#チームみらい`;
    const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterIntentUrl, "_blank", "noopener,noreferrer");
  }, [referralCode]);

  const handleFacebookShare = useCallback(() => {
    const shareUrl = window.location.href;
    const facebookIntentUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookIntentUrl, "_blank", "noopener,noreferrer");
  }, []);

  const handleCopyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      console.log("URLをコピーしました");
    } catch (error) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = window.location.href;
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
  };
}
