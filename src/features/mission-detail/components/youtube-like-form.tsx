"use client";

import { SubmitButton } from "@/components/common/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  checkYouTubeConnectionStatusAction,
  checkYouTubeLikesAction,
  submitManualYouTubeLikeAction,
} from "@/features/youtube/actions/youtube-like-actions";
import {
  AlertCircle,
  CheckCircle,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

type Props = {
  missionId: string;
  isCompleted: boolean;
  onSuccess: () => void;
};

export function YouTubeLikeForm({ missionId, isCompleted, onSuccess }: Props) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [displayName, setDisplayName] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // YouTube連携状態を確認
  useEffect(() => {
    const checkConnection = async () => {
      const result = await checkYouTubeConnectionStatusAction();
      setIsConnected(result.isConnected);
      setDisplayName(result.displayName);
    };
    checkConnection();
  }, []);

  // 自動チェック
  const handleAutoCheck = () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result = await checkYouTubeLikesAction(missionId);

      if (!result.success) {
        setErrorMessage(result.error || "エラーが発生しました");
        return;
      }

      if (result.newAchievements > 0) {
        setSuccessMessage(
          `${result.newAchievements}件の新しいいいねが見つかりました！`,
        );
        onSuccess();
      } else if (result.alreadyAchieved > 0) {
        setSuccessMessage(
          "チームみらい動画へのいいねは全て記録済みです。新しい動画にいいねしてみましょう！",
        );
      } else {
        setSuccessMessage(
          "チームみらい関連の動画へのいいねが見つかりませんでした。チームみらいの動画にいいねしてから再度お試しください。",
        );
      }
    });
  };

  // 手動提出
  const handleManualSubmit = () => {
    if (!manualUrl.trim()) {
      setErrorMessage("YouTube動画のURLを入力してください");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result = await submitManualYouTubeLikeAction(missionId, manualUrl);

      if (!result.success) {
        setErrorMessage(result.error || "エラーが発生しました");
        return;
      }

      if (result.isNewAchievement) {
        setSuccessMessage("ミッション達成を記録しました！");
        setManualUrl("");
        onSuccess();
      } else {
        setSuccessMessage("この動画は既に達成済みです");
      }
    });
  };

  // ローディング中
  if (isConnected === null) {
    return (
      <div className="flex items-center justify-center p-4">
        <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 成功メッセージ */}
      {successMessage && (
        <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="h-4 w-4 mr-2 shrink-0" />
          {successMessage}
        </div>
      )}

      {/* エラーメッセージ */}
      {errorMessage && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* YouTube連携済みの場合 */}
      {isConnected ? (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            連携中: {displayName || "YouTubeアカウント"}
          </div>

          {/* 自動チェックボタン */}
          <Button
            onClick={handleAutoCheck}
            disabled={isPending}
            className="w-full"
            size="lg"
          >
            {isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                確認中...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                いいねを確認する
              </>
            )}
          </Button>

          {/* 手動登録エリア */}
          <div className="border-t pt-4">
            <button
              type="button"
              onClick={() => setIsManualMode(!isManualMode)}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mx-auto"
            >
              {isManualMode ? "▲ 手動登録を閉じる" : "▼ 手動で登録する"}
            </button>

            {isManualMode && (
              <div className="mt-4 space-y-3">
                <Input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  disabled={isPending}
                />
                <SubmitButton
                  onClick={handleManualSubmit}
                  disabled={isPending || !manualUrl.trim()}
                  pendingText="登録中..."
                  className="w-full"
                >
                  登録する
                </SubmitButton>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* YouTube未連携の場合 */
        <div className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            YouTubeアカウントを連携すると、いいねした動画を自動で確認できます
          </div>

          <Link href="/settings/integrations">
            <Button className="w-full" size="lg">
              <ExternalLink className="h-4 w-4 mr-2" />
              YouTubeと連携する
            </Button>
          </Link>

          {/* 手動登録エリア（連携なし） */}
          <div className="border-t pt-4">
            <button
              type="button"
              onClick={() => setIsManualMode(!isManualMode)}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mx-auto"
            >
              {isManualMode
                ? "▲ 手動登録を閉じる"
                : "▼ 連携せずに手動で登録する"}
            </button>

            {isManualMode && (
              <div className="mt-4 space-y-3">
                <Input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  disabled={isPending}
                />
                <SubmitButton
                  onClick={handleManualSubmit}
                  disabled={isPending || !manualUrl.trim()}
                  pendingText="登録中..."
                  className="w-full"
                >
                  登録する
                </SubmitButton>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 達成済みメッセージ */}
      {isCompleted && (
        <div className="text-sm text-muted-foreground text-center">
          このミッションは何度でもチャレンジできます。
          <br />
          新しいチームみらい動画にいいねして記録しましょう！
        </div>
      )}
    </div>
  );
}
