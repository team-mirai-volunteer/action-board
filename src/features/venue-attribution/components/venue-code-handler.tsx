"use client";

import { useEffect } from "react";
import { setClientCookie } from "@/lib/utils/cookies";
import { isValidVenueCodeFormat } from "@/lib/validation/venue-attribution";

interface VenueCodeHandlerProps {
  venueCode: string;
}

// キャラバン等の会場別QRコード付きURL（?cv=会場コード）から遷移してきた場合に
// 会場コードを保持し、サインアップ時の会場別アトリビューション計測に使う
export function VenueCodeHandler({ venueCode }: VenueCodeHandlerProps) {
  useEffect(() => {
    // 会場コードをcookieに保存（30日間有効）
    if (isValidVenueCodeFormat(venueCode)) {
      setClientCookie("venue_code", venueCode, {
        maxAge: 60 * 60 * 24 * 30, // 30日
        path: "/",
        sameSite: "lax",
      });
    }

    // URLから会場コードパラメータを削除（履歴に残さない）
    const url = new URL(window.location.href);
    url.searchParams.delete("cv");
    window.history.replaceState({}, "", url.toString());
  }, [venueCode]);

  // このコンポーネントは何も表示しない
  return null;
}
