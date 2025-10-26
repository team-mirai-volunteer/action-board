import { Card, CardTitle } from "@/components/ui/card";
import type { MissionAchievementSummary } from "@/features/user-achievements/types/achievement-types";
import { cn } from "@/lib/utils/styles";
import Link from "next/link";

interface UserMissionAchievementsProps {
  achievements: MissionAchievementSummary[];
  totalCount: number;
}

const UserMissionAchievements = ({
  achievements,
  totalCount,
}: UserMissionAchievementsProps) => {
  const achievementCardStyle =
    "flex justify-between p-4 items-center font-bold";
  return (
    <Card className="p-4 mt-4 flex flex-col gap-2">
      <CardTitle className="text-lg mb-2">ミッション達成状況</CardTitle>
      <Card
        className={cn(
          achievementCardStyle,
          "border-2 border-teal-200 bg-gradient-to-br from-white to-emerald-50",
        )}
      >
        <div>🏆 総達成数</div>
        <div>
          <span className="text-3xl text-teal-600 px-1">{totalCount}</span>
          <span className="text-xl">回</span>
        </div>
      </Card>
      {achievements.map((achievement) => (
        <Link
          href={`/missions/${achievement.mission_id}`}
          key={achievement.mission_id}
        >
          <Card className={achievementCardStyle}>
            <div className="text-sm">{achievement.mission_title}</div>
            <div>
              <span className="text-2xl text-teal-600 px-2">
                {achievement.achievement_count}
              </span>
              <span>回</span>
            </div>
          </Card>
        </Link>
      ))}
    </Card>
  );
};
export default UserMissionAchievements;
