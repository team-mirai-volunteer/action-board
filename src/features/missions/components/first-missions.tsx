import Missions, { type MissionsProps } from "./mission-list";

// はじめのミッションに表示するミッション（この配列の並び順で表示される）
export const FIRST_MISSION_SLUGS = [
  "add-supporter-line-friend",
  "join-prefecture-openchat",
  "join-slack",
] as const;

//コードの2重管理回避のためmission-list.tsxを参照する
export default function FirstMissions(
  props: Omit<MissionsProps, "filterSlugs">,
) {
  return (
    <Missions
      {...props}
      filterSlugs={FIRST_MISSION_SLUGS}
      title="🚩 はじめのミッション"
      id="first-missions"
    />
  );
}
