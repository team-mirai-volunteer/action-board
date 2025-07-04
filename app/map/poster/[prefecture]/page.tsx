import {
  POSTER_PREFECTURE_MAP,
  type PosterPrefectureKey,
  getPrefectureDefaultZoom,
} from "@/lib/constants/poster-prefectures";
import {
  getDefaultViewport,
  getPosterBoardStats,
  getPosterBoardsInViewport,
} from "@/lib/services/poster-boards-server";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import PrefecturePosterMapClient from "./PrefecturePosterMapClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ prefecture: string }>;
}): Promise<Metadata> {
  const { prefecture } = await params;
  const prefectureKey = prefecture as PosterPrefectureKey;
  const prefectureData = POSTER_PREFECTURE_MAP[prefectureKey];
  const prefectureName = prefectureData?.jp || prefecture;
  return {
    title: `${prefectureName}のポスター掲示板マップ`,
    description: `${prefectureName}のポスター掲示板の配置状況を確認できます`,
  };
}

const validPrefectures = Object.keys(
  POSTER_PREFECTURE_MAP,
) as PosterPrefectureKey[];

// 統計情報を非同期で取得するコンポーネント
async function PosterBoardStatsLoader({
  prefecture,
}: {
  prefecture: string;
}) {
  const stats = await getPosterBoardStats(prefecture);

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {/* 統計情報の表示 */}
      {stats && (
        <>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">総掲示板数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.done || 0}
            </div>
            <div className="text-sm text-muted-foreground">貼付完了</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.total > 0
                ? Math.round(((stats.done || 0) / stats.total) * 100)
                : 0}
              %
            </div>
            <div className="text-sm text-muted-foreground">達成率</div>
          </div>
        </>
      )}
    </div>
  );
}

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

  // Validate prefecture parameter
  if (!validPrefectures.includes(prefecture as PosterPrefectureKey)) {
    return redirect("/map/poster");
  }

  const prefectureKey = prefecture as PosterPrefectureKey;
  const { jp: prefectureNameJp, center } = POSTER_PREFECTURE_MAP[prefectureKey];
  const zoomLevel = getPrefectureDefaultZoom(prefectureKey);

  // 初期ビューポートの計算
  const defaultViewport = getDefaultViewport(center, zoomLevel);

  // 初期データの取得（Server Componentで実行）
  const initialBoards = await getPosterBoardsInViewport(
    prefectureNameJp,
    defaultViewport,
    200, // 初期表示は200件まで
  );

  // 最適化版を使用するかどうかのフラグ（環境変数で制御）
  const useOptimized = process.env.NEXT_PUBLIC_USE_OPTIMIZED_MAP === "true";

  if (useOptimized) {
    // 統計情報を取得
    const stats = await getPosterBoardStats(prefectureNameJp);

    // 動的インポートで最適化版のコンポーネントを読み込み
    const PrefecturePosterMapOptimized = dynamic(
      () => import("./PrefecturePosterMapOptimized"),
      { ssr: false },
    );

    // 新しい最適化版の実装
    return (
      <PrefecturePosterMapOptimized
        userId={user?.id}
        prefecture={prefectureNameJp}
        prefectureName={prefectureNameJp}
        center={center}
        initialBoards={initialBoards}
        initialStats={stats}
      />
    );
  }

  // 従来の実装を使用
  return (
    <PrefecturePosterMapClient
      userId={user?.id}
      prefecture={prefectureNameJp}
      prefectureName={prefectureNameJp}
      center={center}
    />
  );
}
