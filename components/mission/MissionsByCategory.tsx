import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/types/supabase";
import type { Database } from "@/lib/types/supabase";
import Mission from "./mission";
import type { MissionsProps } from "./missions";

// View の型
type MissionCategoryViewRow =
  Database["public"]["Views"]["mission_category_view"]["Row"];

export default async function MissionsByCategory({
  userId,
  showAchievedMissions,
  title = "📈 ミッション",
}: MissionsProps) {
  const supabase = await createClient();

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
      if (!acc[row.category_id]) acc[row.category_id] = [];
      acc[row.category_id].push(row);
      return acc;
    },
    {},
  );

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col divide-y divide-gray-200">
        {/* タイトル */}
        <div className="text-center py-8">
          <h2 className="text-2xl md:text-4xl font-black text-gray-900">
            {title}
          </h2>
        </div>

        {Object.values(grouped).map((missionsInCategory) => {
          const category = missionsInCategory[0];
          return (
            <section
              key={category.category_id}
              className="
                relative               /* オーバーレイ配置のため */
                w-full
                max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl
                mx-auto
                bg-gray-50
                rounded-lg
                shadow-sm
                px-6 py-5
              "
            >
              {/* カテゴリ見出し */}
              <h3 className="text-xl font-bold mb-4 pl-3">
                🚩{category.category_title}
              </h3>

              {/* 横スクロール領域 */}
              <div className="w-full overflow-x-auto custom-scrollbar cursor-grab">
                <div className="flex gap-4 px-4 pb-2">
                  {missionsInCategory
                    .filter(
                      (m) =>
                        showAchievedMissions ||
                        !achievedMissionIds.includes(m.mission_id),
                    )
                    .map((m) => {
                      const missionForComponent: Tables<"missions"> = {
                        id: m.mission_id,
                        title: m.title,
                        icon_url: m.icon_url,
                        difficulty: m.difficulty,
                        content: m.content,
                        created_at: m.created_at,
                        artifact_label: m.artifact_label,
                        max_achievement_count: m.max_achievement_count,
                        event_date: m.event_date,
                        is_featured: m.is_featured,
                        updated_at: m.updated_at,
                        is_hidden: m.is_hidden,
                        ogp_image_url: m.ogp_image_url,
                        required_artifact_type: m.required_artifact_type ?? "",
                      };

                      return (
                        <div
                          key={m.mission_id}
                          className="flex-shrink-0 w-[280px]"
                        >
                          <Mission
                            mission={missionForComponent}
                            achieved={achievedMissionIds.includes(m.mission_id)}
                            achievementsCount={
                              achievementCountMap.get(m.mission_id) ?? 0
                            }
                            userAchievementCount={
                              userAchievementCountMap.get(m.mission_id) ?? 0
                            }
                          />
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* スクロール余白を示すグラデーション */}
              <div
                className="
                  pointer-events-none
                  absolute inset-y-0 left-0 w-8
                  bg-gradient-to-r from-gray-50 to-transparent
                "
              />
              <div
                className="
                  pointer-events-none
                  absolute inset-y-0 right-0 w-8
                  bg-gradient-to-l from-gray-50 to-transparent
                "
              />
            </section>
          );
        })}
      </div>
    </div>
  );
}
