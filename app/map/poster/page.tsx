import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

// 変更点1: データ構造を地域ごとにグループ化
const REGIONS = [
  {
    name: "北海道・東北",
    prefectures: [
      "北海道",
      "青森県",
      "岩手県",
      "宮城県",
      "秋田県",
      "山形県",
      "福島県",
    ],
  },
  {
    name: "関東",
    prefectures: [
      "茨城県",
      "栃木県",
      "群馬県",
      "埼玉県",
      "千葉県",
      "東京都",
      "神奈川県",
    ],
  },
  {
    name: "中部",
    prefectures: [
      "新潟県",
      "富山県",
      "石川県",
      "福井県",
      "山梨県",
      "長野県",
      "岐阜県",
      "静岡県",
      "愛知県",
    ],
  },
  {
    name: "近畿",
    prefectures: [
      "三重県",
      "滋賀県",
      "京都府",
      "大阪府",
      "兵庫県",
      "奈良県",
      "和歌山県",
    ],
  },
  {
    name: "中国",
    prefectures: ["鳥取県", "島根県", "岡山県", "広島県", "山口県"],
  },
  {
    name: "四国",
    prefectures: ["徳島県", "香川県", "愛媛県", "高知県"],
  },
  {
    name: "九州・沖縄",
    prefectures: [
      "福岡県",
      "佐賀県",
      "長崎県",
      "熊本県",
      "大分県",
      "宮崎県",
      "鹿児島県",
      "沖縄県",
    ],
  },
];

export default async function PosterMapMenuPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">ポスターマップ - 都道府県選択</h1>

      {/* 変更点2: 地域ごとにループし、見出しと都道府県のグリッドを表示 */}
      {REGIONS.map((region) => (
        <div key={region.name} className="mb-12">
          <h2 className="text-2xl font-semibold border-b-2 border-gray-200 pb-2 mb-6">
            {region.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {region.prefectures.map((prefecture) => (
              <Link
                key={prefecture}
                href={`/map/poster/${encodeURIComponent(prefecture)}`}
                className="block p-4 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {prefecture}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
