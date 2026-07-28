import Missions, { type MissionsProps } from "./mission-list";

//コードの2重管理回避のためmissions.tsxを参照する
export default function FeaturedMissions(
  props: Omit<MissionsProps, "filterFeatured">,
) {
  return (
    <Missions
      {...props}
      filterFeatured={true}
      title="🌱 はじめのミッション"
      subTitle="はじめのミッションは獲得ポイントが2倍となります"
      id="featured-missions"
    />
  );
}
