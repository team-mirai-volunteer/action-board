"use client";

import { useEffect } from "react";
import { setClientCookie } from "@/lib/utils/cookies";

interface ReferralCodeHandlerProps {
  referralCode: string;
}

export function ReferralCodeHandler({
  referralCode,
}: ReferralCodeHandlerProps) {
  useEffect(() => {
    // リファラルコードをcookieに保存（30日間有効）
    setClientCookie("referral_code", referralCode, {
      maxAge: 60 * 60 * 24 * 30, // 30日
      path: "/",
      sameSite: "lax",
    });

    // URLからリファラルコードパラメータを削除（履歴に残さない）
    const url = new URL(window.location.href);
    url.searchParams.delete("ref");
    window.history.replaceState({}, "", url.toString());
  }, [referralCode]);

  // このコンポーネントは何も表示しない
  return null;
}
