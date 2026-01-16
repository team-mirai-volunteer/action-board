import { Button } from "@/components/ui/button";
import { UserNameWithBadge } from "@/features/party-membership/components/user-name-with-badge";
import type { ActivityTimelineItem } from "@/features/user-activity/types/activity-types";
import UserAvatar from "@/features/user-profile/components/user-avatar";
import type { Tables } from "@/lib/types/supabase";
/**
 * 活動タイムライン表示コンポーネント
 *
 * このコンポーネントは以下の機能を提供します：
 * - ユーザーの活動履歴を時系列で表示
 * - ページネーション機能（「もっと見る」ボタン）
 * - 活動タイプに応じた適切なメッセージ表示
 * - ユーザーアバターとプロフィールリンク
 * - 空状態の適切な処理
 *
 * 使用場所：
 * - ホームページの活動セクション
 * - ユーザー詳細ページの活動タイムライン
 */
import { dateTimeFormatter } from "@/lib/utils/date-formatters";
import Link from "next/link";

interface ActivityTimelineProps {
  /** 表示する活動データの配列 */
  timeline: Tables<"activity_timeline_view">[] | ActivityTimelineItem[];
  /** 次のページが存在するかどうか */
  hasNext: boolean;
  /** 「もっと見る」ボタンクリック時のコールバック関数 */
  onLoadMore?: () => void;
}

export function ActivityTimeline({
  timeline,
  hasNext,
  onLoadMore,
}: ActivityTimelineProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* 空状態の表示 */}
      {timeline.length === 0 && <div>活動履歴がありません</div>}

      {/* 活動アイテムのリスト表示 */}
      {timeline.map((activity, idx) => (
        <div
          key={activity.id || idx}
          className="flex flex-row gap-2 items-center"
        >
          {/* ユーザーアバターとプロフィールリンク */}
          <Link href={`/users/${activity.user_id}`}>
            <UserAvatar
              className="w-10 h-10"
              userProfile={{
                name: activity.name,
                avatar_url: activity.avatar_url,
              }}
            />
          </Link>

          {/* 活動内容の表示 */}
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center text-sm">
              {activity.address_prefecture ? (
                <span>{activity.address_prefecture}の</span>
              ) : null}
              <UserNameWithBadge
                name={`${activity.name ?? ""}さん`}
                membership={
                  "party_membership" in activity
                    ? (activity.party_membership ?? null)
                    : null
                }
                badgeSize={16}
                className="gap-0.5 mr-1"
              />
              <span>
                {/* 活動タイプに応じたメッセージ表示 */}
                {activity.activity_type === "signup" ? (
                  activity.title // サインアップの場合はタイトルのみ
                ) : (
                  <>
                    が「
                    {activity.mission_id ? (
                      <Link
                        href={`/missions/${activity.mission_id}`}
                        className="text-black font-bold hover:underline"
                      >
                        {activity.title}
                      </Link>
                    ) : (
                      activity.title
                    )}
                    」を達成しました！
                  </>
                )}
              </span>
            </div>

            {/* 活動日時の表示 */}
            <div className="text-xs text-gray-500">
              {activity.created_at &&
                dateTimeFormatter(new Date(activity.created_at))}
            </div>
          </div>
        </div>
      ))}

      {/* ページネーション：「もっと見る」ボタン */}
      {hasNext && (
        <Button variant="outline" onClick={onLoadMore}>
          もっと見る
        </Button>
      )}
    </div>
  );
}
