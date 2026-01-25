import {
  getMissionAchievementCounts,
  getMissionsWithFilter,
} from "@/features/missions/services/missions";
import { getUserMissionAchievements } from "@/features/user-achievements/services/achievements";
import Mission from "./mission-card";

export type MissionsProps = {
  userId?: string;
  maxSize?: number;
  showAchievedMissions: boolean;
  filterFeatured?: boolean;
  title?: string;
  subTitle?: string;
  id?: string;
};

export default async function Missions({
  userId,
  maxSize,
  showAchievedMissions,
  filterFeatured,
  title = "📈 ミッション",
  subTitle,
  id,
}: MissionsProps) {
  // ユーザーの各ミッションに対する達成回数のマップ
  const userAchievementCountMap = userId
    ? await getUserMissionAchievements(userId)
    : new Map<string, number>();

  // ユーザーが達成したミッションIDのリスト
  const achievedMissionIds = Array.from(userAchievementCountMap.keys());

  // すべてのミッションに対する達成人数を取得
  const achievementCountMap = await getMissionAchievementCounts();

  // ミッション一覧を取得
  const missions = await getMissionsWithFilter({
    filterFeatured,
    excludeMissionIds: showAchievedMissions ? [] : achievedMissionIds,
    maxSize,
  });

  return (
    <div className="flex flex-col gap-6 px-4 md:px-0">
      <div className="text-center">
        <h2 id={id} className="text-2xl md:text-3xl">
          {title}
        </h2>
        {subTitle && <p className="text-sm text-gray-600 mt-2">{subTitle}</p>}
      </div>

      {missions && missions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {missions.map((mission) => (
            <Mission
              key={mission.id}
              mission={mission}
              achievementsCount={achievementCountMap.get(mission.id) ?? 0}
              userAchievementCount={
                userAchievementCountMap.get(mission.id) ?? 0
              }
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            未達成のミッションはありません
          </p>
          <p className="text-gray-400 text-sm mt-2">
            新しいミッションが追加されるまでお待ちください
          </p>
        </div>
      )}
    </div>
  );
}
