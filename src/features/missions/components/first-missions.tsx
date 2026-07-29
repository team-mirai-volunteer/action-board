import { getMissionsWithFilter } from "@/features/missions/loaders/missions-loaders";
import { getUserMissionAchievements } from "@/features/user-achievements/loaders/achievements-loaders";
import Missions from "./mission-list";

// はじめのミッションに表示するミッション（この配列の並び順で表示される）
export const FIRST_MISSION_SLUGS = [
  "add-supporter-line-friend",
  "join-prefecture-openchat",
  "join-slack",
] as const;

type FirstMissionsProps = {
  userId?: string;
};

//コードの2重管理回避のためmission-list.tsxを参照する
export default async function FirstMissions({ userId }: FirstMissionsProps) {
  // 達成済みは非表示なので、3件すべて達成するとこのセクションは空になる。
  // 空のセクションだけが余白付きで残らないよう、その場合はセクションごと描画しない
  const achievedMissionIds = userId
    ? Array.from((await getUserMissionAchievements(userId)).keys())
    : [];
  const unachievedMissions = await getMissionsWithFilter({
    filterSlugs: FIRST_MISSION_SLUGS,
    excludeMissionIds: achievedMissionIds,
  });

  if (unachievedMissions.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 bg-background">
      <Missions
        userId={userId}
        showAchievedMissions={false}
        filterSlugs={FIRST_MISSION_SLUGS}
        title="🚩 はじめのミッション"
        subTitle="まずはここから。チームみらいの活動に参加するための最初のステップです"
        id="first-missions"
      />
    </section>
  );
}
