import {
  getMissionAchievementCounts,
  getMissionsWithFilter,
  getPostingCountsForMissions,
} from "@/features/missions/loaders/missions-loaders";
import { getUserMissionAchievements } from "@/features/user-achievements/loaders/achievements-loaders";
import { MissionCardScrollList } from "./mission-card-scroll-list";

export type MissionsProps = {
  userId?: string;
  maxSize?: number;
  showAchievedMissions: boolean;
  filterFeatured?: boolean;
  filterSlugs?: readonly string[];
  title?: string;
  subTitle?: string;
  id?: string;
};

export default async function Missions({
  userId,
  maxSize,
  showAchievedMissions,
  filterFeatured,
  filterSlugs,
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
    filterSlugs,
    excludeMissionIds: showAchievedMissions ? [] : achievedMissionIds,
    maxSize,
  });

  // ポスティングミッションの合計枚数を取得
  const postingCountMap = await getPostingCountsForMissions(missions);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center px-4 md:px-0">
        <h2 id={id} className="text-2xl md:text-3xl">
          {title}
        </h2>
        {subTitle && <p className="text-sm text-gray-600 mt-2">{subTitle}</p>}
      </div>

      {missions && missions.length > 0 ? (
        // カテゴリ別一覧（missions-by-category.tsx）と同じ横スクロール・同じ左余白で並べる
        <div className="relative w-screen md:pl-10">
          <MissionCardScrollList
            missions={missions}
            achievementCountMap={achievementCountMap}
            postingCountMap={postingCountMap}
            userAchievementCountMap={userAchievementCountMap}
          />
        </div>
      ) : (
        <div className="text-center py-12 px-4 md:px-0">
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
