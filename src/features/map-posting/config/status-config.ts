// ポスティングシェイプのステータス設定

export type PostingShapeStatus =
  | "planned"
  | "completed"
  | "unavailable"
  | "other";

export const statusConfig: Record<
  PostingShapeStatus,
  {
    label: string;
    shortLabel?: string;
    color: string;
    fillColor: string;
    fillOpacity: number;
  }
> = {
  planned: {
    label: "予定",
    color: "bg-blue-500",
    fillColor: "#3b82f6",
    fillOpacity: 0.3,
  },
  completed: {
    label: "完了",
    color: "bg-green-500",
    fillColor: "#22c55e",
    fillOpacity: 0.5,
  },
  unavailable: {
    label: "配布不可",
    shortLabel: "不可",
    color: "bg-red-500",
    fillColor: "#ef4444",
    fillOpacity: 0.3,
  },
  other: {
    label: "その他",
    color: "bg-purple-500",
    fillColor: "#a855f7",
    fillOpacity: 0.3,
  },
};

// ステータスの表示順序
export const statusOrder: PostingShapeStatus[] = [
  "planned",
  "completed",
  "unavailable",
  "other",
];

// デフォルトステータス
export const defaultStatus: PostingShapeStatus = "planned";
