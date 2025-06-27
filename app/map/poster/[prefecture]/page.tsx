import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/supabase";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PrefecturePosterMapClient from "./PrefecturePosterMapClient";

type PrefectureEnum = Database["public"]["Enums"]["prefecture_enum"];

// Map prefecture enum values to Japanese names
const prefectureNameMap: Record<PrefectureEnum, string> = {
  hokkaido: "北海道",
  miyagi: "宮城県",
  saitama: "埼玉県",
  chiba: "千葉県",
  tokyo: "東京都",
  kanagawa: "神奈川県",
  nagano: "長野県",
  aichi: "愛知県",
  osaka: "大阪府",
  hyogo: "兵庫県",
  ehime: "愛媛県",
  fukuoka: "福岡県",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ prefecture: string }>;
}): Promise<Metadata> {
  const { prefecture } = await params;
  const prefectureName = validPrefectures.includes(prefecture as PrefectureEnum)
    ? prefectureNameMap[prefecture as PrefectureEnum]
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

  return (
    <PrefecturePosterMapClient
      userId={user.id}
      prefecture={prefecture as PrefectureEnum}
    />
  );
}
