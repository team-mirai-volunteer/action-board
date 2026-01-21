import {
  getMissionAchievementCounts,
  getMissionCategoryView,
} from "@/features/missions/services/missions";
import { getUserMissionAchievements } from "@/features/user-achievements/services/achievements";
import type { Tables } from "@/lib/types/supabase";
import { HorizontalScrollContainer } from "./horizontal-scroll-container";
import Mission from "./mission-card";
import type { MissionsProps } from "./mission-list";

export default async function MissionsByCategory({
  userId,
  showAchievedMissions,
}: MissionsProps) {
  // ユーザーの各ミッションに対する達成回数のマップ
  const userAchievementCountMap = userId
    ? await getUserMissionAchievements(userId)
    : new Map<string, number>();

  // ユーザーが達成したミッションIDのリスト
  const achievedMissionIds = Array.from(userAchievementCountMap.keys());

  // 全体の達成数取得
  const achievementCountMap = await getMissionAchievementCounts();

  // View からミッションデータ取得
  const data = await getMissionCategoryView();

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          ミッションが見つかりませんでした
        </p>
      </div>
    );
  }

  // カテゴリごとにグループ化
  const grouped = data.reduce<
    Record<string, Tables<"mission_category_view">[]>
  >((acc, row) => {
    // category_idがnullの場合はスキップ
    if (!row.category_id) return acc;

    if (!acc[row.category_id]) acc[row.category_id] = [];
    acc[row.category_id].push(row);
    return acc;
  }, {});

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

  return (
    <div className="flex flex-col gap-11">
      <h2 className="text-center text-2xl md:text-3xl my-5">📈 ミッション</h2>

      {Object.values(grouped).map((missionsInCategory) => {
        const category = missionsInCategory[0];
        return (
          <section
            key={category.category_id}
            className="
                relative               /* オーバーレイ配置のため */
                w-screen
                md:pl-10
              "
          >
            {/* カテゴリ見出し */}
            <h3 className="text-xl font-bold pl-4 md:pl-0">
              {category.category_title}
            </h3>

            {/* 横スクロール領域 */}
            <HorizontalScrollContainer>
              <div className="flex w-fit gap-4 pl-4 md:pl-0 pr-4 pb-2 pt-4">
                {missionsInCategory
                  .filter(
                    (m) =>
                      m.mission_id &&
                      (showAchievedMissions ||
                        !achievedMissionIds.includes(m.mission_id)),
                  )
                  .map((m) => {
                    // filterでmission_idがnullでないことを確認済み
                    // mission_idが存在することが保証されているので、安全にアクセス
                    const missionId = m.mission_id as string;

                    const missionForComponent = {
                      id: missionId,
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

                    return (
                      <div key={missionId} className="shrink-0 w-[300px]">
                        <Mission
                          mission={missionForComponent}
                          achievementsCount={
                            achievementCountMap.get(missionId) ?? 0
                          }
                          userAchievementCount={
                            userAchievementCountMap.get(missionId) ?? 0
                          }
                        />
                      </div>
                    );
                  })}
              </div>
            </HorizontalScrollContainer>
          </section>
        );
      })}
    </div>
  );
}
