import { createClient } from "@/lib/supabase/server";
import Mission from "./mission";

export type MissionsProps = {
  userId?: string;
  maxSize?: number;
  showAchievedMissions: boolean;
  filterFeatured?: boolean;
  title?: string;
  id?: string;
};

export default async function Missions({
  userId,
  maxSize,
  showAchievedMissions,
  filterFeatured,
  title = "📈 ミッション",
  id,
}: MissionsProps) {
  const supabase = await createClient();

  // ユーザーが達成したミッションIDのリスト
  let achievedMissionIds: string[] = [];
  // ユーザーの各ミッションに対する達成回数のマップ
  let userAchievementCountMap = new Map<string, number>();

  if (userId) {
    // ユーザーの達成情報を取得
    const { data: achievements } = await supabase
      .from("achievements")
      .select("mission_id")
      .eq("user_id", userId);

    // 達成したミッションIDのリストを作成
    achievedMissionIds =
      achievements?.map((achievement) => achievement.mission_id ?? "") ?? [];

    // 各ミッションの達成回数をカウント
    if (achievements && achievements.length > 0) {
      const missionCounts = achievements.reduce((counts, achievement) => {
        const missionId = achievement.mission_id;
        if (missionId) {
          counts.set(missionId, (counts.get(missionId) || 0) + 1);
        }
        return counts;
      }, new Map<string, number>());

      userAchievementCountMap = missionCounts;
    }
  }

  // すべてのミッションに対する達成人数を取得
  const { data: achievement_count } = await supabase
    .from("mission_achievement_count_view")
    .select("mission_id, achievement_count");
  const achievement_count_map = new Map(
    achievement_count?.map((achievement) => [
      achievement.mission_id,
      achievement.achievement_count,
    ]),
  );

  let query = supabase
    .from("missions")
    .select()
    .eq("is_hidden", false) // 非表示のミッションを除外
    .order("difficulty", { ascending: true })
    .order("created_at", { ascending: false });
  if (filterFeatured) {
    query = query.eq("is_featured", true);
  }

  if (!showAchievedMissions) {
    query = query.not("id", "in", `("${achievedMissionIds.join('","')}")`);
  }
  const { data: missions } = maxSize ? await query.limit(maxSize) : await query;

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h2
            id={id}
            className="text-2xl md:text-4xl font-black text-gray-900 mb-2 scroll-mt-20"
          >
            {title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {missions && missions.length > 0 ? (
            missions.map((mission) => (
              <Mission
                key={mission.id}
                mission={mission}
                achieved={achievedMissionIds.includes(mission.id)}
                achievementsCount={achievement_count_map.get(mission.id) ?? 0}
                userAchievementCount={
                  userAchievementCountMap.get(mission.id) ?? 0
                }
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">
                未達成のミッションはありません
              </p>
              <p className="text-gray-400 text-sm mt-2">
                新しいミッションが追加されるまでお待ちください
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
