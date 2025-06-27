import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/supabase";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PrefecturePosterMapClient from "./PrefecturePosterMapClient";

type PrefectureEnum = Database["public"]["Enums"]["poster_prefecture_enum"];

// Map prefecture enum values to Japanese names and center coordinates
const prefectureData: Record<
  PrefectureEnum,
  { name: string; center: [number, number] }
> = {
  hokkaido: { name: "北海道", center: [43.0642, 141.3469] },
  miyagi: { name: "宮城県", center: [38.2688, 140.8721] },
  saitama: { name: "埼玉県", center: [35.857, 139.649] },
  chiba: { name: "千葉県", center: [35.605, 140.1233] },
  tokyo: { name: "東京都", center: [35.6762, 139.6503] },
  kanagawa: { name: "神奈川県", center: [35.4478, 139.6425] },
  nagano: { name: "長野県", center: [36.6513, 138.181] },
  aichi: { name: "愛知県", center: [35.1802, 136.9066] },
  osaka: { name: "大阪府", center: [34.6937, 135.5023] },
  hyogo: { name: "兵庫県", center: [34.6913, 135.1831] },
  ehime: { name: "愛媛県", center: [33.8416, 132.7658] },
  fukuoka: { name: "福岡県", center: [33.5904, 130.4017] },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ prefecture: string }>;
}): Promise<Metadata> {
  const { prefecture } = await params;
  const prefectureName = validPrefectures.includes(prefecture as PrefectureEnum)
    ? prefectureData[prefecture as PrefectureEnum].name
    : prefecture;
  return {
    title: `${prefectureName}のポスター掲示板マップ`,
    description: `${prefectureName}のポスター掲示板の配置状況を確認できます`,
  };
}

const validPrefectures: PrefectureEnum[] = [
  "hokkaido",
  "miyagi",
  "saitama",
  "chiba",
  "tokyo",
  "kanagawa",
  "nagano",
  "aichi",
  "osaka",
  "hyogo",
  "ehime",
  "fukuoka",
];

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

  // Validate prefecture parameter
  if (!validPrefectures.includes(prefecture as PrefectureEnum)) {
    return redirect("/map/poster");
  }

  const validPrefecture = prefecture as PrefectureEnum;
  const { name: prefectureName, center } = prefectureData[validPrefecture];

  return (
    <PrefecturePosterMapClient
      userId={user.id}
      prefecture={validPrefecture}
      prefectureName={prefectureName}
      center={center}
    />
  );
}
