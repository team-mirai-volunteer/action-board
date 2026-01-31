"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  YouTubeCommentList,
  YouTubeLikedList,
  YouTubeLinkButton,
  YouTubeSyncButton,
  YouTubeVideoList,
} from "@/features/youtube/components";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface YouTubeSettingsContentProps {
  isLinked: boolean;
  channelTitle?: string;
  thumbnailUrl?: string;
  linkedAt?: string;
  defaultTab?: string;
}

export function YouTubeSettingsContent({
  isLinked,
  channelTitle,
  thumbnailUrl,
  linkedAt,
  defaultTab = "likes",
}: YouTubeSettingsContentProps) {
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
          Googleアカウントを通じてYouTubeチャンネルと連携すると、あなたがいいねやアップロードした
          #チームみらい 動画を確認できます。
        </p>

        <YouTubeLinkButton
          isLinked={isLinked}
          channelTitle={channelTitle}
          thumbnailUrl={thumbnailUrl}
          returnUrl="/settings/youtube"
          onUnlink={handleUnlink}
        />

        {linkedAt && (
          <p className="text-xs text-gray-400 mt-3">
            連携日時: {new Date(linkedAt).toLocaleDateString("ja-JP")}
          </p>
        )}
      </section>

      {/* 動画/いいね/コメントタブセクション（連携済みの場合のみ表示） */}
      {isLinked && (
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <Tabs defaultValue={defaultTab} className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="likes">いいね</TabsTrigger>
                <TabsTrigger value="comments">コメント</TabsTrigger>
                <TabsTrigger value="videos">アップロード</TabsTrigger>
              </TabsList>
              <YouTubeSyncButton onSyncComplete={handleSyncComplete} />
            </div>

            <TabsContent value="likes" className="mt-4">
              <div className="text-sm text-gray-600 mb-4">
                あなたがいいねしたチームみらい動画の一覧です。
                <br />
                Youtubeで動画にいいねをつけてミッションをクリアしましょう！
                <br />
                <Link
                  href="/missions/youtube-like"
                  className="text-primary hover:underline"
                >
                  ミッションページへ →
                </Link>
                <p className="text-xs text-gray-500 mt-2">
                  ※ 同期時は最新100件のいいねをチェックします
                </p>
              </div>
              <YouTubeLikedList refreshTrigger={refreshTrigger} />
            </TabsContent>

            <TabsContent value="comments" className="mt-4">
              <div className="text-sm text-gray-600 mb-4">
                あなたがコメントしたチームみらい動画の一覧です。
                <br />
                Youtubeで動画にコメントしてミッションをクリアしましょう！
                <br />
                <Link
                  href="/missions/youtube-comment"
                  className="text-primary hover:underline"
                >
                  ミッションページへ →
                </Link>
                <p className="text-xs text-gray-500 mt-2">
                  ※ 同期時は直近1ヶ月の動画のコメントをチェックします
                  <br />※ 直近1時間のコメントは自動検出されない場合があります
                </p>
              </div>
              <YouTubeCommentList refreshTrigger={refreshTrigger} />
            </TabsContent>

            <TabsContent value="videos" className="mt-4">
              <p className="text-sm text-gray-600">
                あなたがアップロードしたチームみらい動画一覧です。
              </p>
              {/* 注意事項 */}
              <section className="text-xs text-gray-500 mb-4">
                <p>
                  ※ 動画の統計情報（再生数、いいね数など）は日次で更新されます
                </p>
              </section>
              <YouTubeVideoList refreshTrigger={refreshTrigger} />
            </TabsContent>
          </Tabs>
        </section>
      )}

      {/* 注意事項 */}
      <section className="text-sm text-gray-500 space-y-2">
        <p>
          ※ 連携したYouTubeアカウントの動画のうち、#チームみらい または
          #teammirai ハッシュタグが含まれる動画のみが取得されます。
        </p>
      </section>
    </div>
  );
}
