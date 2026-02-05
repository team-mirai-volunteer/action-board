import { HorizontalScrollContainer } from "@/features/missions/components/horizontal-scroll-container";
import Mission from "@/features/missions/components/mission-card";
import { getMissionDisplayCount } from "@/features/missions/utils/get-mission-display-count";
import type { MissionForComponent } from "@/features/missions/utils/group-missions-by-category";

interface RelatedMissionsProps {
  missions: MissionForComponent[];
  categoryTitle: string;
  userAchievementCountMap: Map<string, number>;
  achievementCountMap: Map<string, number>;
  postingCountMap?: Map<string, number>;
}

export async function RelatedMissions({
  missions,
  categoryTitle,
  userAchievementCountMap,
  achievementCountMap,
  postingCountMap,
}: RelatedMissionsProps) {
  if (missions.length === 0) {
    return null; // ミッションがない場合は何も表示しない
  }

  return (
    <section className="relative w-screen ml-[calc(50%-50vw)] md:pl-10 mt-10">
      <h2 className="text-xl font-bold mb-4 pl-4 md:pl-0 ">
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
                achievementsCount={getMissionDisplayCount(
                  mission.id,
                  achievementCountMap,
                  postingCountMap,
                )}
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
