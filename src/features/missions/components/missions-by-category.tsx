import {
  getMissionAchievementCounts,
  getMissionCategoryView,
  getPostingCountsForMissions,
} from "@/features/missions/loaders/missions-loaders";
import { groupMissionsByCategory } from "@/features/missions/utils/group-missions-by-category";
import { getUserMissionAchievements } from "@/features/user-achievements/loaders/achievements-loaders";
import { MissionCardScrollList } from "./mission-card-scroll-list";
import type { MissionsProps } from "./mission-list";

export default async function MissionsByCategory({
  userId,
  showAchievedMissions,
}: MissionsProps) {
  // ユーザーの各ミッションに対する達成回数のマップ
  const userAchievementCountMap = userId
    ? await getUserMissionAchievements(userId)
    : new Map<string, number>();

  // ユーザーが達成したミッションIDのリスト
  const achievedMissionIds = Array.from(userAchievementCountMap.keys());

  // 全体の達成数取得
  const achievementCountMap = await getMissionAchievementCounts();

  // View からミッションデータ取得
  const data = await getMissionCategoryView();

  // ポスティングミッションの合計枚数を取得
  const missionsForPostingCount = data
    .filter((m) => m.mission_id)
    .map((m) => ({
      id: m.mission_id as string,
      required_artifact_type: m.required_artifact_type,
    }));
  const postingCountMap = await getPostingCountsForMissions(
    missionsForPostingCount,
  );

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          ミッションが見つかりませんでした
        </p>
      </div>
    );
  }

  // カテゴリごとにグループ化・ソート・フィルタリング・変換
  const categories = groupMissionsByCategory(data, userAchievementCountMap, {
    showAchievedMissions,
    achievedMissionIds,
  });

  return (
    <div className="flex flex-col gap-11">
      <h2 className="text-center text-2xl md:text-3xl my-5">🎯 ミッション</h2>

      {categories.map((category) => (
        <section
          key={category.categoryId}
          className="
              relative               /* オーバーレイ配置のため */
              w-screen
              md:pl-10
            "
        >
          {/* カテゴリ見出し */}
          <h3 className="text-xl font-bold pl-4 md:pl-0">
            {category.categoryTitle}
          </h3>

          {/* 横スクロール領域 */}
          <MissionCardScrollList
            missions={category.missions}
            achievementCountMap={achievementCountMap}
            postingCountMap={postingCountMap}
            userAchievementCountMap={userAchievementCountMap}
          />
        </section>
      ))}
    </div>
  );
}
