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
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const storedState = sessionStorage.getItem("lineLoginState");

        // CSRF対策: stateの検証
        if (!state || state !== storedState) {
          throw new Error("Invalid state parameter");
        }

        if (!code) {
          throw new Error("Authorization code not received");
        }

        // セッションストレージからサインアップ時のデータを取得
        const storedData = sessionStorage.getItem("lineLoginData");
        const loginData = storedData ? JSON.parse(storedData) : {};

        // Server Actionを呼び出し
        const result = await handleLineAuthAction(
          code,
          loginData.dateOfBirth,
          loginData.referralCode,
        );

        if (result.success) {
          // セッションストレージをクリア
          sessionStorage.removeItem("lineLoginState");
          sessionStorage.removeItem("lineLoginData");

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
