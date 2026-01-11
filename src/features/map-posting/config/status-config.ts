import type { PostingShapeStatus } from "../types/posting-types";

export const statusConfig: Record<
  PostingShapeStatus,
  { label: string; color: string; bgColor: string }
> = {
  planned: {
    label: "配布予定",
    color: "#3B82F6", // blue-500
    bgColor: "bg-blue-500",
  },
  completed: {
    label: "配布完了",
    color: "#10B981", // green-500
    bgColor: "bg-green-500",
  },
  unavailable: {
    label: "配布不可",
    color: "#6B7280", // gray-500
    bgColor: "bg-gray-500",
  },
  other: {
    label: "その他",
    color: "#8B5CF6", // purple-500
    bgColor: "bg-purple-500",
  },
};

export const statusOptions: PostingShapeStatus[] = [
  "planned",
  "completed",
  "unavailable",
  "other",
];
