import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/supabase";
import { HorizontalScrollContainer } from "./horizontal-scroll-container";
import Mission from "./mission-card";
import type { MissionsProps } from "./mission-list";

// View の型
type MissionCategoryViewRow =
  Database["public"]["Views"]["mission_category_view"]["Row"];

export default async function MissionsByCategory({
  userId,
  showAchievedMissions,
}: MissionsProps) {
  const supabase = createClient();

  // ユーザーの達成状況取得
  let achievedMissionIds: string[] = [];
  let userAchievementCountMap = new Map<string, number>();
  if (userId) {
    const { data: achievements } = await supabase
      .from("achievements")
      .select("mission_id")
      .eq("user_id", userId);

    achievedMissionIds = achievements?.map((a) => a.mission_id ?? "") ?? [];
    if (achievements) {
      userAchievementCountMap = achievements.reduce((map, a) => {
        if (a.mission_id) {
          map.set(a.mission_id, (map.get(a.mission_id) || 0) + 1);
        }
        return map;
      }, new Map<string, number>());
    }
  }

  // 全体の達成数取得
  const { data: achievementCounts } = await supabase
    .from("mission_achievement_count_view")
    .select("mission_id, achievement_count");

  const achievementCountMap = new Map(
    achievementCounts?.map((a) => [a.mission_id, a.achievement_count]) ?? [],
  );

  // View からミッションデータ取得
  const { data, error } = await supabase
    .from("mission_category_view")
    .select(`
      category_id,
      category_title,
      category_kbn,
      category_sort_no,
      mission_id,
      title,
      icon_url,
      difficulty,
      content,
      created_at,
      artifact_label,
      max_achievement_count,
      event_date,
      is_featured,
      updated_at,
      is_hidden,
      ogp_image_url,
      required_artifact_type,
      link_sort_no
    `)
    .order("category_sort_no", { ascending: true })
    .order("link_sort_no", { ascending: true });

  if (error || !data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          ミッションが見つかりませんでした
        </p>
      </div>
    );
  }

  // カテゴリごとにグループ化
  const grouped = data.reduce<Record<string, MissionCategoryViewRow[]>>(
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

  return (
    <div className="flex flex-col gap-6">
      {/* タイトル */}

      <h2 className="text-center md:text-4xl">📈 ミッション</h2>

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
            <h3 className="text-xl font-bold mb-4">
              {category.category_title}
            </h3>

            {/* 横スクロール領域 */}
            <HorizontalScrollContainer>
              <div className="flex w-fit gap-4 p-2">
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
                      <div key={missionId} className="flex-shrink-0 w-[300px]">
                        <Mission
                          mission={missionForComponent}
                          achieved={achievedMissionIds.includes(missionId)}
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
