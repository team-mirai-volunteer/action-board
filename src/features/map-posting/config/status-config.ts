import type { Database } from "@/lib/types/supabase";

export type PostingShapeStatus =
  Database["public"]["Enums"]["posting_shape_status"];

export const postingStatusConfig: Record<
  PostingShapeStatus,
  { label: string; color: string; fillColor: string; fillOpacity: number }
> = {
  planned: {
    label: "配布予定",
    color: "#3B82F6", // blue-500
    fillColor: "#93C5FD", // blue-300
    fillOpacity: 0.4,
  },
  completed: {
    label: "配布完了",
    color: "#10B981", // green-500
    fillColor: "#6EE7B7", // green-300
    fillOpacity: 0.4,
  },
  unavailable: {
    label: "配布不可",
    color: "#EF4444", // red-500
    fillColor: "#FCA5A5", // red-300
    fillOpacity: 0.4,
  },
  other: {
    label: "その他",
    color: "#8B5CF6", // purple-500
    fillColor: "#C4B5FD", // purple-300
    fillOpacity: 0.4,
  },
};

export const postingStatusBadgeColors: Record<PostingShapeStatus, string> = {
  planned: "bg-blue-500",
  completed: "bg-green-500",
  unavailable: "bg-red-500",
  other: "bg-purple-500",
};

// クラスターアイコン用のステータス色
export const postingStatusColors: Record<PostingShapeStatus, string> = {
  planned: "#3B82F6", // blue
  completed: "#10B981", // green
  unavailable: "#EF4444", // red
  other: "#8B5CF6", // purple
};

// デフォルトのクラスタリングしきい値ズームレベル
// これ以上でポリゴン表示、未満でクラスター表示
export const CLUSTER_THRESHOLD_ZOOM = 13;

/**
 * 面積に応じたクラスタリング閾値ズームレベルを計算
 * 大きいshape → 低い閾値（広域でポリゴン表示）
 * 小さいshape → 高い閾値（ズームしてからポリゴン表示）
 *
 * @param areaM2 ポリゴンの面積（平方メートル）
 * @returns 閾値ズームレベル
 */
export function getClusterThresholdForArea(areaM2: number | null): number {
  if (!areaM2) return CLUSTER_THRESHOLD_ZOOM;

  // 面積による閾値の段階分け
  if (areaM2 >= 100_000_000) return 8; // 100km²以上: ズーム8からポリゴン
  if (areaM2 >= 10_000_000) return 10; // 10km²以上: ズーム10からポリゴン
  if (areaM2 >= 1_000_000) return 12; // 1km²以上: ズーム12からポリゴン
  return CLUSTER_THRESHOLD_ZOOM;
}

// ステータスラベル（ツールチップ等で使用）
export const postingStatusLabels: Record<PostingShapeStatus, string> = {
  planned: "配布予定",
  completed: "配布完了",
  unavailable: "配布不可",
  other: "その他",
};
