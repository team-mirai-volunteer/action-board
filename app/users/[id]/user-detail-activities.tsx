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

import { ActivityTimeline } from "@/components/activity-timeline";
import type { ActivityTimelineItem } from "@/lib/services/activityTimeline";
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
}

export default function UserDetailActivities(props: UserDetailActivitiesProps) {
  const [timeline, setTimeline] = useState<ActivityTimelineItem[]>(
    props.initialTimeline,
  );

  const [hasNext, setHasNext] = useState(
    props.totalCount > props.initialTimeline.length,
  );

  const [isLoading, setIsLoading] = useState(false);

  /**
   * 「もっと見る」ボタンクリック時の処理
   * APIエンドポイント経由で追加データを取得し、既存データに追加
   */
  const handleLoadMore = async () => {
    if (isLoading) return; // 重複リクエスト防止

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/users/${props.userId}/activity-timeline?limit=${props.pageSize}&offset=${timeline.length}`,
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
        setHasNext(updatedTimeline.length < props.totalCount);
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
    <div>
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
    </div>
  );
}
