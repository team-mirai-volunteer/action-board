import Missions, { type MissionsProps } from "./mission-list";

//コードの2重管理回避のためmissions.tsxを参照する
export default function FeaturedMissions(
  props: Pick<MissionsProps, "userId" | "showAchievedMissions">,
) {
  return (
    <Missions
      {...props}
      filterFeatured={true}
      title="🎯 重要ミッション"
      id="featured-missions"
    />
  );
}
