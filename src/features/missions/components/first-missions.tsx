import { getMissionsWithFilter } from "@/features/missions/loaders/missions-loaders";
import { getUserMissionAchievements } from "@/features/user-achievements/loaders/achievements-loaders";
import Missions from "./mission-list";

// はじめのミッションに表示するミッション（この配列の並び順で表示される）
export const FIRST_MISSION_SLUGS = [
  "watch-anno-welcome-message",
  "add-supporter-line-friend",
  "join-prefecture-openchat",
  "join-slack",
] as const;

// 見出し下の説明文。スマホで折り返さず1行に収めるため 20 文字以内に保つ
// （text-sm = 14px の全角 1 文字 ≒ 14px、コンテナ幅は viewport - 32px の
//  `px-4` 分なので、320px 端末で 288px / 20文字が上限）
export const FIRST_MISSIONS_SUB_TITLE = "まずはここから始めてみましょう";
export const FIRST_MISSIONS_SUB_TITLE_MAX_LENGTH = 20;

type FirstMissionsProps = {
  userId?: string;
};

//コードの2重管理回避のためmission-list.tsxを参照する
export default async function FirstMissions({ userId }: FirstMissionsProps) {
  // 達成済みは非表示なので、掲載ミッションをすべて達成するとこのセクションは空になる。
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
        subTitle={FIRST_MISSIONS_SUB_TITLE}
        id="first-missions"
      />
    </section>
  );
}
