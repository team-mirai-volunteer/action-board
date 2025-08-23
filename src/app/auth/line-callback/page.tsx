"use client";

import { handleLineAuthAction } from "@/app/actions";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function LineCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // まずLINE側からのエラーパラメータをチェック
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        if (error) {
          let errorMessage = "LINE認証に失敗しました";

          switch (error) {
            case "access_denied":
              errorMessage =
                "LINE認証がキャンセルされました。再度お試しください。";
              break;
            case "invalid_request":
              errorMessage =
                "認証リクエストが無効です。管理者にお問い合わせください。";
              break;
            case "unauthorized_client":
              errorMessage =
                "認証設定に問題があります。管理者にお問い合わせください。";
              break;
            case "unsupported_response_type":
              errorMessage =
                "サポートされていない認証方式です。管理者にお問い合わせください。";
              break;
            case "invalid_scope":
              errorMessage =
                "認証スコープが無効です。管理者にお問い合わせください。";
              break;
            case "server_error":
              errorMessage =
                "LINE側でエラーが発生しました。しばらく経ってから再度お試しください。";
              break;
            case "temporarily_unavailable":
              errorMessage =
                "LINE認証が一時的に利用できません。しばらく経ってから再度お試しください。";
              break;
            default:
              errorMessage = errorDescription || `LINE認証エラー: ${error}`;
          }

          throw new Error(errorMessage);
        }

        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const storedState = localStorage.getItem("lineLoginState");

        // CSRF対策: stateの検証
        if (!state || state !== storedState) {
          throw new Error("セキュリティエラー: 認証状態が無効です");
        }

        if (!code) {
          throw new Error("認証コードが取得できませんでした");
        }

        // ローカルストレージからサインアップ時のデータを取得
        const storedData = localStorage.getItem("lineLoginData");
        const loginData = storedData ? JSON.parse(storedData) : {};
        const returnUrl = localStorage.getItem("lineLoginReturnUrl");

        // Server Actionを呼び出し
        const result = await handleLineAuthAction(
          code,
          loginData.dateOfBirth,
          loginData.referralCode,
          returnUrl,
        );

        if (result.success) {
          // ローカルストレージをクリア
          localStorage.removeItem("lineLoginState");
          localStorage.removeItem("lineLoginData");
          localStorage.removeItem("lineLoginReturnUrl");

          // サーバーコンポーネントを強制的に再レンダリング
          router.refresh();

          // リダイレクト
          router.push(result.redirectTo);
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "ログイン処理に失敗しました",
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
          <p>LINEログイン処理中...</p>
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
              ログインエラー
            </h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => router.push("/sign-in")}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              ログイン画面に戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function LineCallbackPage() {
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
      <LineCallbackContent />
    </Suspense>
  );
}
