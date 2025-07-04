import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/supabase";

type PosterBoard = Database["public"]["Tables"]["poster_boards"]["Row"];

export interface Viewport {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface ClusteredBoard {
  lat: number;
  lng: number;
  count: number;
  boards: PosterBoard[];
}

/**
 * ビューポート内のポスター掲示板データを取得
 * Server Component専用
 */
export async function getPosterBoardsInViewport(
  prefecture: string,
  viewport: Viewport,
  limit = 500,
): Promise<PosterBoard[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("poster_boards")
    .select("*")
    .eq("prefecture", prefecture)
    .gte("lat", viewport.south)
    .lte("lat", viewport.north)
    .gte("long", viewport.west)
    .lte("long", viewport.east)
    .limit(limit);

  if (error) {
    console.error("Error fetching poster boards:", error);
    return [];
  }

  return data || [];
}

/**
 * 初期表示用のデフォルトビューポートを計算
 * 都道府県の中心から適切な範囲を設定
 */
export function getDefaultViewport(
  center: [number, number],
  zoomLevel: number,
): Viewport {
  // ズームレベルに基づいて表示範囲を計算
  // 簡易的な実装（実際の地図投影を考慮する場合はより複雑な計算が必要）
  const latRange = 0.5 / 2 ** (zoomLevel - 10);
  const lngRange = 0.7 / 2 ** (zoomLevel - 10);

  return {
    north: center[0] + latRange,
    south: center[0] - latRange,
    east: center[1] + lngRange,
    west: center[1] - lngRange,
  };
}

/**
 * 都道府県の統計情報を効率的に取得
 * Server Component専用
 */
export async function getPosterBoardStats(prefecture: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("poster_boards")
    .select("status")
    .eq("prefecture", prefecture);

  if (error) {
    console.error("Error fetching poster board stats:", error);
    return null;
  }

  // ステータスごとの集計
  const stats = data.reduce(
    (acc, board) => {
      acc[board.status] = (acc[board.status] || 0) + 1;
      acc.total++;
      return acc;
    },
    { total: 0 } as Record<string, number>,
  );

  return stats;
}

/**
 * クラスタリング用のグリッドベースのデータ取得
 * 低ズームレベルでの表示用
 */
export async function getClusteredPosterBoards(
  prefecture: string,
  viewport: Viewport,
  gridSize = 0.01, // 約1km四方のグリッド
): Promise<ClusteredBoard[]> {
  const supabase = await createClient();

  // ビューポート内のすべての掲示板を取得
  const { data, error } = await supabase
    .from("poster_boards")
    .select("*")
    .eq("prefecture", prefecture)
    .gte("lat", viewport.south)
    .lte("lat", viewport.north)
    .gte("long", viewport.west)
    .lte("long", viewport.east);

  if (error || !data) {
    console.error("Error fetching poster boards for clustering:", error);
    return [];
  }

  // グリッドベースでクラスタリング
  const clusters = new Map<string, ClusteredBoard>();

  for (const board of data) {
    if (board.lat && board.long) {
      const gridLat = Math.floor(board.lat / gridSize) * gridSize;
      const gridLng = Math.floor(board.long / gridSize) * gridSize;
      const key = `${gridLat},${gridLng}`;

      if (!clusters.has(key)) {
        clusters.set(key, {
          lat: gridLat + gridSize / 2,
          lng: gridLng + gridSize / 2,
          count: 0,
          boards: [],
        });
      }

      const cluster = clusters.get(key);
      if (!cluster) continue;
      cluster.count++;
      cluster.boards.push(board);
    }
  }

  return Array.from(clusters.values());
}
