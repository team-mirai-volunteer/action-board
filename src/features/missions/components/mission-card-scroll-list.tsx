import { getMissionDisplayCount } from "@/features/missions/utils/get-mission-display-count";
import type { Tables } from "@/lib/types/supabase";
import { HorizontalScrollContainer } from "./horizontal-scroll-container";
import Mission from "./mission-card";

type MissionCardScrollListProps = {
  missions: Tables<"missions">[];
  achievementCountMap: Map<string, number>;
  postingCountMap: Map<string, number>;
  userAchievementCountMap: Map<string, number>;
};

// ミッションカード（幅300px）を横スクロールで並べる。
// トップページの各ミッションセクションで同じカードサイズ・並び方にするための共通部品
export function MissionCardScrollList({
  missions,
  achievementCountMap,
  postingCountMap,
  userAchievementCountMap,
}: MissionCardScrollListProps) {
  return (
    <HorizontalScrollContainer>
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
  );
}
