"use client";

import { useEffect } from "react";
import { setClientCookie } from "@/lib/utils/cookies";
import { isValidCampaignCodeFormat } from "@/lib/validation/campaign-attribution";

interface CampaignCodeHandlerProps {
  campaignCode: string;
}

// キャンペーンコード付きURL（?cv=コード）から遷移してきた場合にコードを保持し、
// サインアップ時の流入元別アトリビューション計測に使う（キャラバン会場QR・オンラインイベント等）
export function CampaignCodeHandler({
  campaignCode,
}: CampaignCodeHandlerProps) {
  useEffect(() => {
    // キャンペーンコードをcookieに保存（30日間有効）
    if (isValidCampaignCodeFormat(campaignCode)) {
      setClientCookie("campaign_code", campaignCode, {
        maxAge: 60 * 60 * 24 * 30, // 30日
        path: "/",
        sameSite: "lax",
      });
    }

    // URLからキャンペーンコードパラメータを削除（履歴に残さない）
    const url = new URL(window.location.href);
    url.searchParams.delete("cv");
    window.history.replaceState({}, "", url.toString());
  }, [campaignCode]);

  // このコンポーネントは何も表示しない
  return null;
}
