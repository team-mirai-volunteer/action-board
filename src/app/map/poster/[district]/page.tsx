import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageBreadcrumb } from "@/components/common/page-breadcrumb";
import {
  getPosterBoardStatsByDistrictAction,
  getUserEditedBoardIdsByDistrictAction,
} from "@/features/map-poster/actions/poster-boards";
import DetailedPosterMapClient from "@/features/map-poster/components/detailed-poster-map-client";
import {
  isValidDistrict,
  POSTER_DISTRICT_MAP,
  type PosterDistrictKey,
} from "@/features/map-poster/constants/poster-district-shugin-2026";
import { getDistrictsWithBoards } from "@/features/map-poster/loaders/poster-boards-loaders";
import { getUser } from "@/features/user-profile/services/profile";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ district: string }>;
}): Promise<Metadata> {
  const { district: districtKey } = await params;

  // 静的に定義された区割りをチェック
  if (isValidDistrict(districtKey)) {
    const districtData = POSTER_DISTRICT_MAP[districtKey];
    return {
      title: `${districtData.jp}のポスター掲示板マップ`,
      description: `${districtData.jp}のポスター掲示板の配置状況を確認できます`,
    };
  }

  // DBから区割り名を取得して検証
  const validDistricts = await getDistrictsWithBoards();
  const matchedDistrict = validDistricts.find(
    (d) => d.toLowerCase().replace(/[^a-z0-9]/g, "-") === districtKey,
  );

  if (matchedDistrict) {
    return {
      title: `${matchedDistrict}のポスター掲示板マップ`,
      description: `${matchedDistrict}のポスター掲示板の配置状況を確認できます`,
    };
  }

  return {
    title: "ポスター掲示板マップ",
    description: "ポスター掲示板の配置状況を確認できます",
  };
}

export default async function DistrictPosterMapPage({
  params,
}: {
  params: Promise<{ district: string }>;
}) {
  const { district: districtKey } = await params;

  const user = await getUser();

  // 静的に定義された区割りをチェック
  let districtJp: string;
  let center: [number, number];
  let defaultZoom: number;

  if (isValidDistrict(districtKey)) {
    const districtData = POSTER_DISTRICT_MAP[districtKey as PosterDistrictKey];
    districtJp = districtData.jp;
    center = districtData.center;
    defaultZoom = districtData.defaultZoom;
  } else {
    // DBから区割り名を取得して検証
    const validDistricts = await getDistrictsWithBoards();
    const matchedDistrict = validDistricts.find(
      (d) => d.toLowerCase().replace(/[^a-z0-9]/g, "-") === districtKey,
    );

    if (!matchedDistrict) {
      return redirect("/map/poster");
    }

    districtJp = matchedDistrict;
    // デフォルトの中心座標とズーム（東京付近）
    center = [35.6762, 139.6503];
    defaultZoom = 13;
  }

  // 区割り別の統計情報を取得
  const stats = await getPosterBoardStatsByDistrictAction(districtJp);

  // ユーザーが最後に編集した掲示板IDを取得
  let userEditedBoardIds: string[] = [];
  if (user?.id) {
    userEditedBoardIds = await getUserEditedBoardIdsByDistrictAction(
      districtJp,
      user.id,
    );
  }

  return (
    <>
      <div className="container mx-auto max-w-7xl px-4 pt-4">
        <PageBreadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "ポスター掲示板マップ", href: "/map/poster" },
            { label: districtJp },
          ]}
        />
      </div>
      <DetailedPosterMapClient
        userId={user?.id}
        prefecture={districtJp}
        prefectureName={districtJp}
        center={center}
        initialStats={stats}
        boardTotal={null}
        userEditedBoardIds={userEditedBoardIds}
        defaultZoom={defaultZoom}
        isDistrict={true}
      />
    </>
  );
}
