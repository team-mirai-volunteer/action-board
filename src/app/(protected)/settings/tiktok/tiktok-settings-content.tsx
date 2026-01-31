"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  TikTokLinkButton,
  TikTokSyncButton,
  TikTokVideoList,
} from "@/features/tiktok/components";

interface TikTokSettingsContentProps {
  isLinked: boolean;
  tiktokDisplayName?: string;
  tiktokAvatarUrl?: string;
  linkedAt?: string;
}

export function TikTokSettingsContent({
  isLinked,
  tiktokDisplayName,
  tiktokAvatarUrl,
  linkedAt,
}: TikTokSettingsContentProps) {
  const router = useRouter();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUnlink = () => {
    router.refresh();
  };

  const handleSyncComplete = (syncedCount: number) => {
    if (syncedCount > 0) {
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  return (
    <div className="space-y-8">
      {/* 連携状態セクション */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          アカウント連携
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          TikTokアカウントを連携すると、あなたの #チームみらい
          動画を自動的に取得できます。
        </p>

        <TikTokLinkButton
          isLinked={isLinked}
          tiktokDisplayName={tiktokDisplayName}
          tiktokAvatarUrl={tiktokAvatarUrl}
          returnUrl="/settings/tiktok"
          onUnlink={handleUnlink}
        />

        {linkedAt && (
          <p className="text-xs text-gray-400 mt-3">
            連携日時: {new Date(linkedAt).toLocaleDateString("ja-JP")}
          </p>
        )}
      </section>

      {/* 動画一覧セクション（連携済みの場合のみ表示） */}
      {isLinked && (
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              #チームみらい 動画
            </h2>
            <TikTokSyncButton onSyncComplete={handleSyncComplete} />
          </div>

          <p className="text-sm text-gray-600 mb-4">
            TikTokアカウントから取得した #チームみらい
            ハッシュタグ付きの動画です。
          </p>

          <TikTokVideoList refreshTrigger={refreshTrigger} />
        </section>
      )}

      {/* 注意事項 */}
      <section className="text-sm text-gray-500 space-y-2">
        <p>
          ※ 連携したTikTokアカウントの動画のうち、#チームみらい または
          #teammirai ハッシュタグが含まれる動画のみが取得されます。
        </p>
        <p>※ 動画の統計情報（再生数、いいね数など）は日次で更新されます。</p>
      </section>
    </div>
  );
}
