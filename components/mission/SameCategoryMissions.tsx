import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/supabase";
import Mission from "./mission";

interface SameCategoryMissionsProps {
  currentMissionId: string;
  userId?: string;
}

export default async function SameCategoryMissions({
  currentMissionId,
  userId,
}: SameCategoryMissionsProps) {
  const supabase = await createClient();

  const { data: currentMissionData } = await supabase
    .from("mission_category_view")
    .select("category_id, category_title")
    .eq("mission_id", currentMissionId)
    .single();

  if (!currentMissionData?.category_id) {
    return null;
  }

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

  const { data: achievementCounts } = await supabase
    .from("mission_achievement_count_view")
    .select("mission_id, achievement_count");

  const achievementCountMap = new Map(
    achievementCounts?.map((a) => [a.mission_id, a.achievement_count]) ?? [],
  );

  const { data, error } = await supabase
    .from("mission_category_view")
    .select(`
      category_id,
      category_title,
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
    .eq("category_id", currentMissionData.category_id)
    .neq("mission_id", currentMissionId)
    .order("link_sort_no", { ascending: true });

  if (error || !data || data.length === 0) {
    return null;
  }

  const sortedMissions = data.sort((a, b) => {
    if (!a.mission_id || !b.mission_id) return 0;

    const aAchievementCount = userAchievementCountMap.get(a.mission_id) ?? 0;
    const bAchievementCount = userAchievementCountMap.get(b.mission_id) ?? 0;

    const aIsMaxAchieved =
      a.max_achievement_count && aAchievementCount >= a.max_achievement_count;
    const bIsMaxAchieved =
      b.max_achievement_count && bAchievementCount >= b.max_achievement_count;

    if (aIsMaxAchieved && !bIsMaxAchieved) {
      return 1;
    }
    if (!aIsMaxAchieved && bIsMaxAchieved) {
      return -1;
    }

    return (a.link_sort_no ?? 0) - (b.link_sort_no ?? 0);
  });

  return (
    <section className="relative -mx-4 md:-mx-10 py-5">
      <h3 className="text-xl font-bold mb-4 px-4 md:px-10">
        同じカテゴリのミッション
      </h3>

      <div
        className="w-full overflow-x-auto custom-scrollbar"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="flex w-fit gap-4 px-4 md:px-10 pb-2">
          {sortedMissions
            .filter((m) => m.mission_id)
            .map((m) => {
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
              };

              return (
                <div key={missionId} className="flex-shrink-0 w-[300px]">
                  <Mission
                    mission={missionForComponent}
                    achieved={achievedMissionIds.includes(missionId)}
                    achievementsCount={achievementCountMap.get(missionId) ?? 0}
                    userAchievementCount={
                      userAchievementCountMap.get(missionId) ?? 0
                    }
                  />
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
}
