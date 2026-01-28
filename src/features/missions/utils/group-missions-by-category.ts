import type { Tables } from "@/lib/types/supabase";

type MissionCategoryView = Tables<"mission_category_view">;
export type MissionForComponent = Tables<"missions">;

export interface GroupMissionsByCategoryOptions {
  showAchievedMissions: boolean;
  achievedMissionIds: string[];
}

export interface CategoryWithMissions {
  categoryId: string;
  categoryTitle: string;
  missions: MissionForComponent[];
}

/**
 * ミッションをカテゴリごとにグループ化し、各カテゴリ内でソート・フィルタリング・変換を行う
 *
 * 処理順:
 * 1. カテゴリごとにグループ化
 * 2. 上限まで達成済みのミッションを後ろにソート
 * 3. 達成済みミッションのフィルタリング（オプション）
 * 4. MissionForComponent型への変換
 */
export function groupMissionsByCategory(
  data: MissionCategoryView[],
  userAchievementCountMap: Map<string, number>,
  options: GroupMissionsByCategoryOptions,
): CategoryWithMissions[] {
  const { showAchievedMissions, achievedMissionIds } = options;

  // カテゴリごとにグループ化
  const grouped = data.reduce<Record<string, MissionCategoryView[]>>(
    (acc, row) => {
      // category_idがnullの場合はスキップ
      if (!row.category_id) return acc;

      if (!acc[row.category_id]) acc[row.category_id] = [];
      acc[row.category_id].push(row);
      return acc;
    },
    {},
  );

  // カテゴリ内のミッションをソート
  for (const categoryId in grouped) {
    grouped[categoryId].sort((a, b) => {
      // mission_idがnullの場合の処理
      if (!a.mission_id || !b.mission_id) return 0;

      // 上限まで達成済みのミッションを後ろに移動
      const aAchievementCount = userAchievementCountMap.get(a.mission_id) ?? 0;
      const bAchievementCount = userAchievementCountMap.get(b.mission_id) ?? 0;

      const aIsMaxAchieved =
        a.max_achievement_count && aAchievementCount >= a.max_achievement_count;
      const bIsMaxAchieved =
        b.max_achievement_count && bAchievementCount >= b.max_achievement_count;

      if (aIsMaxAchieved && !bIsMaxAchieved) {
        return 1; // a を後ろに
      }
      if (!aIsMaxAchieved && bIsMaxAchieved) {
        return -1; // b を後ろに
      }

      // それ以外はリンクのソート順で比較
      return (a.link_sort_no ?? 0) - (b.link_sort_no ?? 0);
    });
  }

  // カテゴリごとにフィルタリングと変換を行い、結果を配列として返す
  return Object.entries(grouped).map(([categoryId, missionsInCategory]) => {
    const category = missionsInCategory[0];

    const missions = missionsInCategory
      .filter(
        (m) =>
          m.mission_id &&
          (showAchievedMissions || !achievedMissionIds.includes(m.mission_id)),
      )
      .map((m): MissionForComponent => {
        const missionId = m.mission_id as string;
        // slugはviewから取得、なければmission_idをフォールバックとして使用
        const slug = "slug" in m && m.slug ? (m.slug as string) : missionId;
        return {
          id: missionId,
          slug,
          title: m.title || "",
          icon_url: m.icon_url,
          difficulty: m.difficulty || 1,
          content: m.content || "",
          created_at: m.created_at || new Date().toISOString(),
          artifact_label: m.artifact_label,
          max_achievement_count: m.max_achievement_count,
          event_date: m.event_date,
          is_featured: m.is_featured || false,
          updated_at: m.updated_at || new Date().toISOString(),
          is_hidden: m.is_hidden || false,
          ogp_image_url: m.ogp_image_url,
          required_artifact_type: m.required_artifact_type || "",
          featured_importance: null,
        };
      });

    return {
      categoryId,
      categoryTitle: category.category_title || "",
      missions,
    };
  });
}
