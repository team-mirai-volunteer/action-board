/**
 * ホームページ用活動タイムラインコンポーネント
 *
 * このコンポーネントは以下の機能を提供します：
 * - 最新の活動10件を表示
 * - リアルタイム活動記録の可視化
 * - レスポンシブデザイン対応
 *
 * 表示内容：
 * - ユーザーのサインアップ活動
 * - ミッション達成活動
 * - 時系列順での表示（新しい順）
 *
 * 注意：ページネーション機能は提供しない（最新10件のみ）
 */
import { ActivityTimeline } from "@/components/activity-timeline";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function Activities() {
  const supabase = await createClient();

  const { data: activityTimelines } = await supabase
    .from("activity_timeline_view")
    .select()
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col gap-6">
        {/* セクションヘッダー */}
        <div className="text-center">
          <h2 className="text-2xl md:text-4xl text-gray-900 mb-2">
            ⏰ 活動タイムライン
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            リアルタイムで更新される活動記録
          </p>
        </div>

        {/* 活動タイムライン表示カード */}
        <Card className="border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 bg-white">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              {/* 
                ActivityTimelineコンポーネントを使用
                - hasNext=false: ホームページでは最新10件のみ表示、ページネーションなし
                - onLoadMore未指定: 「もっと見る」ボタンは表示されない
              */}
              <ActivityTimeline
                timeline={activityTimelines ?? []}
                hasNext={false}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
