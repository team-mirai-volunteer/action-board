import type { MissionAchievementSummary } from "@/lib/services/userMissionAchievement";
import { MissionAchievementCard } from "./mission-card";
import { MissionAchievementTotalCard } from "./total-card";

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
            title={achievement.mission_title}
            count={achievement.achievement_count}
          />
        ))}
      </div>
    </div>
  );
}
