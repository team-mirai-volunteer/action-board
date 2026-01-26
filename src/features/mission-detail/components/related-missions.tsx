import { HorizontalScrollContainer } from "@/features/missions/components/horizontal-scroll-container";
import Mission from "@/features/missions/components/mission-card";
import { getMissionAchievementCounts } from "@/features/missions/services/missions";
import type { MissionForComponent } from "@/features/missions/utils/group-missions-by-category";
import { getUserMissionAchievements } from "@/features/user-achievements/services/achievements";

interface RelatedMissionsProps {
  missions: MissionForComponent[];
  categoryTitle: string;
  userId?: string;
}

export async function RelatedMissions({
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
      <HorizontalScrollContainer centering={true}>
        <div className="flex w-fit gap-4 pl-4 md:pl-0 pr-4 pb-2 pt-4">
          {missions.map((mission) => (
            <div key={mission.id} className="shrink-0 w-[300px]">
              <Mission
                mission={mission}
                achievementsCount={achievementCountMap.get(mission.id) ?? 0}
                userAchievementCount={
                  userAchievementCountMap.get(mission.id) ?? 0
                }
              />
            </div>
          ))}
        </div>
      </HorizontalScrollContainer>
    </section>
  );
}
