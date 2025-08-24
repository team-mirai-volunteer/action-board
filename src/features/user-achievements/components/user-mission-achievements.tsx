import { MissionAchievementCard } from "@/features/user-achievements/components/mission-card";
import { MissionAchievementTotalCard } from "@/features/user-achievements/components/total-card";
import type { MissionAchievementSummary } from "@/features/user-achievements/types/achievement-types";

interface UserMissionAchievementsProps {
  achievements: MissionAchievementSummary[];
  totalCount: number;
}

export function UserMissionAchievements({
  achievements,
  totalCount,
}: UserMissionAchievementsProps) {
  return (
    <div className="w-full">
      <div className="flex flex-row justify-between items-center mb-4">
        <span className="text-lg font-bold">ミッション達成状況</span>
      </div>
      <div className="flex flex-col gap-2">
        <MissionAchievementTotalCard totalCount={totalCount} />
        {achievements.map((achievement) => (
          <MissionAchievementCard
            key={achievement.mission_id}
            missionId={achievement.mission_id}
            title={achievement.mission_title}
            count={achievement.achievement_count}
          />
        ))}
      </div>
    </div>
  );
}
