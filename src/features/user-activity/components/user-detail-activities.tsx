/**
 * ユーザー詳細ページの活動タイムラインコンポーネント
 *
 * このコンポーネントは以下の機能を提供します：
 * - 初期データのSSR表示
 * - クライアントサイドでの追加データ読み込み
 * - ページネーション機能（「もっと見る」ボタン）
 * - エラーハンドリング
 *
 * パフォーマンス最適化：
 * - 初期データはサーバーサイドで取得済み
 * - 追加データのみAPIエンドポイント経由で取得
 * - 状態管理による効率的な再レンダリング
 */
"use client";

import { Card, CardTitle } from "@/components/ui/card";
import { ActivityTimeline } from "@/features/user-activity/components/activity-timeline";
import type { ActivityTimelineItem } from "@/features/user-activity/types/activity-types";
import { useState } from "react";

interface UserDetailActivitiesProps {
  /** サーバーサイドで取得済みの初期タイムラインデータ */
  initialTimeline: ActivityTimelineItem[];
  /** 活動の総数（ページネーション判定用） */
  totalCount: number;
  /** 1ページあたりの表示件数 */
  pageSize: number;
  /** 対象ユーザーのID */
  userId: string;
  /** 特定シーズンの活動のみ表示する場合のシーズンID（オプション） */
  seasonId: string | null;
}

export default function UserDetailActivities({
  initialTimeline,
  totalCount,
  pageSize,
  userId,
  seasonId,
}: UserDetailActivitiesProps) {
  const [timeline, setTimeline] =
    useState<ActivityTimelineItem[]>(initialTimeline);

  const [hasNext, setHasNext] = useState(totalCount > initialTimeline.length);

  const [isLoading, setIsLoading] = useState(false);

  /**
   * 「もっと見る」ボタンクリック時の処理
   * APIエンドポイント経由で追加データを取得し、既存データに追加
   */
  const handleLoadMore = async () => {
    if (isLoading) return; // 重複リクエスト防止

    setIsLoading(true);

    try {
      const seasonParam = seasonId ? `&seasonId=${seasonId}` : "";
      const response = await fetch(
        `/api/users/${userId}/activity-timeline?limit=${pageSize}&offset=${timeline.length}${seasonParam}`,
      );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: Failed to fetch activity timeline`,
        );
      }

      const { timeline: newTimeline } = await response.json();

      if (newTimeline.length > 0) {
        const updatedTimeline = [...timeline, ...newTimeline];
        setTimeline(updatedTimeline);
        setHasNext(updatedTimeline.length < totalCount);
      } else {
        setHasNext(false);
      }
    } catch (error) {
      console.error("Failed to load more activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4 mt-4">
      <CardTitle className="text-lg mb-2">活動タイムライン</CardTitle>
      <ActivityTimeline
        timeline={timeline || []}
        hasNext={hasNext}
        onLoadMore={handleLoadMore}
      />

      {/* ローディング状態の表示 */}
      {isLoading && (
        <div className="text-center text-sm text-gray-500 mt-2">
          読み込み中...
        </div>
      )}
    </Card>
  );
}
