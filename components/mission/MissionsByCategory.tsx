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
  title = "\ud83d\udcc8 \u30df\u30c3\u30b7\u30e7\u30f3",
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
          \u30df\u30c3\u30b7\u30e7\u30f3\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093\u3067\u3057\u305f
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
      <div className="flex flex-col gap-12">
        <div className="text-center">
          <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-2">
            {title}
          </h2>
        </div>

        {Object.values(grouped).map((missionsInCategory) => {
          const category = missionsInCategory[0];
          return (
            <section
              key={category.category_id}
              className="w-[375px] sm:w-full sm:max-w-screen-md mx-auto"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-red-500 text-lg">\ud83d\udccc</span>
                {category.category_title}
              </h3>
              <div className="-mx-4 overflow-x-auto">
                <div className="flex gap-4 w-max px-4">
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
                          className="min-w-[280px] max-w-[280px] shrink-0"
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
            </section>
          );
        })}
      </div>
    </div>
  );
}
