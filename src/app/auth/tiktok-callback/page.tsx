"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { handleTikTokLinkAction } from "@/features/tiktok/actions/tiktok-auth-actions";

function TikTokCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // TikTok側からのエラーパラメータをチェック
        const errorParam = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        if (errorParam) {
          let errorMessage = "TikTok認証に失敗しました";

          switch (errorParam) {
            case "access_denied":
              errorMessage =
                "TikTok認証がキャンセルされました。再度お試しください。";
              break;
            case "invalid_request":
              errorMessage =
                "認証リクエストが無効です。管理者にお問い合わせください。";
              break;
            case "unauthorized_client":
              errorMessage =
                "認証設定に問題があります。管理者にお問い合わせください。";
              break;
            case "server_error":
              errorMessage =
                "TikTok側でエラーが発生しました。しばらく経ってから再度お試しください。";
              break;
            default:
              errorMessage =
                errorDescription || `TikTok認証エラー: ${errorParam}`;
          }

          throw new Error(errorMessage);
        }

        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const storedState = localStorage.getItem("tiktokLoginState");
        const codeVerifier = localStorage.getItem("tiktokCodeVerifier");
        const returnUrl = localStorage.getItem("tiktokLoginReturnUrl");

        // CSRF対策: stateの検証
        if (!state || state !== storedState) {
          throw new Error("セキュリティエラー: 認証状態が無効です");
        }

        if (!code) {
          throw new Error("認証コードが取得できませんでした");
        }

        if (!codeVerifier) {
          throw new Error("認証情報が不足しています。再度お試しください。");
        }

        // Server Actionを呼び出し
        const result = await handleTikTokLinkAction(code, codeVerifier);

        // ローカルストレージをクリア
        localStorage.removeItem("tiktokLoginState");
        localStorage.removeItem("tiktokCodeVerifier");
        localStorage.removeItem("tiktokLoginReturnUrl");

        if (result.success) {
          // サーバーコンポーネントを強制的に再レンダリング
          router.refresh();

          // リダイレクト（成功時は設定ページへ）
          router.push(returnUrl || "/settings/tiktok?linked=true");
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "TikTok連携処理に失敗しました",
        );
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
          <p>TikTok連携処理中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-md">
            <h3 className="text-lg font-medium text-red-800 mb-2">
              TikTok連携エラー
            </h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => router.push("/settings/tiktok")}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              設定画面に戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function TikTokCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
            <p>ページを読み込んでいます...</p>
          </div>
        </div>
      }
    >
      <TikTokCallbackContent />
    </Suspense>
  );
}
