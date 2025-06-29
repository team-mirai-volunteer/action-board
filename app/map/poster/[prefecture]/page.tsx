import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/supabase";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PrefecturePosterMapClient from "./PrefecturePosterMapClient";

type PrefectureEnum = Database["public"]["Enums"]["poster_prefecture_enum"];

// Map prefecture names to center coordinates
const prefectureData: Record<string, { center: [number, number] }> = {
  北海道: { center: [43.0642, 141.3469] },
  宮城県: { center: [38.2688, 140.8721] },
  埼玉県: { center: [35.857, 139.649] },
  千葉県: { center: [35.605, 140.1233] },
  東京都: { center: [35.6762, 139.6503] },
  神奈川県: { center: [35.4478, 139.6425] },
  長野県: { center: [36.6513, 138.181] },
  愛知県: { center: [35.1802, 136.9066] },
  大阪府: { center: [34.6937, 135.5023] },
  兵庫県: { center: [34.6913, 135.1831] },
  愛媛県: { center: [33.8416, 132.7658] },
  福岡県: { center: [33.5904, 130.4017] },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ prefecture: string }>;
}): Promise<Metadata> {
  const { prefecture } = await params;
  const prefectureName = decodeURIComponent(prefecture);
  return {
    title: `${prefectureName}のポスター掲示板マップ`,
    description: `${prefectureName}のポスター掲示板の配置状況を確認できます`,
  };
}

const validPrefectures = Object.keys(prefectureData);

export default async function PrefecturePosterMapPage({
  params,
}: {
  params: Promise<{ prefecture: string }>;
}) {
  const supabase = await createClient();
  const { prefecture } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Decode and validate prefecture parameter
  const decodedPrefecture = decodeURIComponent(prefecture);
  if (!validPrefectures.includes(decodedPrefecture)) {
    return redirect("/map/poster");
  }

  const { center } = prefectureData[decodedPrefecture];

  return (
    <PrefecturePosterMapClient
      userId={user.id}
      prefecture={decodedPrefecture}
      prefectureName={decodedPrefecture}
      center={center}
    />
  );
}
