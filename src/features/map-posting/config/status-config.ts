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
