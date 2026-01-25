import { HorizontalScrollContainer } from "@/features/missions/components/horizontal-scroll-container";
import Mission from "@/features/missions/components/mission-card";
import { getMissionAchievementCounts } from "@/features/missions/services/missions";
import { getUserMissionAchievements } from "@/features/user-achievements/services/achievements";
import type { Tables } from "@/lib/types/supabase";

interface RelatedMissionsProps {
  missions: Tables<"mission_category_view">[];
  categoryTitle: string | null;
  userId?: string;
}

export default async function RelatedMissions({
  missions,
  categoryTitle,
  userId,
}: RelatedMissionsProps) {
  if (missions.length === 0) {
    return null; // ミッションがない場合は何も表示しない
  }

  // ユーザーの各ミッションに対する達成回数のマップ
  const userAchievementCountMap = userId
    ? await getUserMissionAchievements(userId)
    : new Map<string, number>();

  // 全体の達成数取得
  const achievementCountMap = await getMissionAchievementCounts();

  return (
    <section className="relative w-screen ml-[calc(50%-50vw)] md:pl-10 text-center">
      <h2 className="text-xl font-bold mb-4 pl-4 md:pl-0 text-center">
        {categoryTitle
          ? `「${categoryTitle}」の他のミッション`
          : "関連ミッション"}
      </h2>
      <HorizontalScrollContainer layout="center">
        <div className="flex w-fit gap-4 pl-4 md:pl-0 pr-4 pb-2 pt-4">
          {missions.map((missionView) => {
            if (!missionView.mission_id) return null;

            const missionId = missionView.mission_id;
            const userAchievementCount =
              userAchievementCountMap.get(missionId) ?? 0;
            const achievementsCount = achievementCountMap.get(missionId) ?? 0;

            const missionForComponent = {
              id: missionId,
              title: missionView.title || "",
              icon_url: missionView.icon_url,
              difficulty: missionView.difficulty || 1,
              content: missionView.content || "",
              created_at: missionView.created_at || new Date().toISOString(),
              artifact_label: missionView.artifact_label,
              max_achievement_count: missionView.max_achievement_count,
              event_date: missionView.event_date,
              is_featured: missionView.is_featured || false,
              updated_at: missionView.updated_at || new Date().toISOString(),
              is_hidden: missionView.is_hidden || false,
              ogp_image_url: missionView.ogp_image_url,
              required_artifact_type: missionView.required_artifact_type || "",
              featured_importance: null,
            };

            return (
              <div key={missionId} className="shrink-0 w-[300px]">
                <Mission
                  mission={missionForComponent}
                  achievementsCount={achievementsCount}
                  userAchievementCount={userAchievementCount}
                />
              </div>
            );
          })}
        </div>
      </HorizontalScrollContainer>
    </section>
  );
}
