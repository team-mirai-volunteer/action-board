"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { PosterPlacement } from "../types/poster-tracking-types";

interface MyPlacementsListProps {
  placements: PosterPlacement[];
  onDelete: (id: string) => Promise<void>;
  onFlyTo: (lat: number, lng: number) => void;
}

export function MyPlacementsList({
  placements,
  onDelete,
  onFlyTo,
}: MyPlacementsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  if (placements.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4 text-sm">
        まだ掲示記録がありません。地図をタップしてポスターを記録しましょう。
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-60 overflow-y-auto">
      {placements.map((p) => {
        const displayAddress = [p.prefecture, p.city, p.address]
          .filter(Boolean)
          .join("");
        return (
          <div
            key={p.id}
            className="flex items-center justify-between p-2 bg-gray-50 rounded-md text-sm"
          >
            <button
              type="button"
              className="flex-1 text-left hover:text-blue-600 transition-colors"
              onClick={() => onFlyTo(p.lat, p.lng)}
            >
              <div className="font-medium">{displayAddress || "住所不明"}</div>
              <div className="text-xs text-muted-foreground">
                {p.poster_count}枚 ・{" "}
                {new Date(p.created_at).toLocaleDateString("ja-JP")}
              </div>
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => handleDelete(p.id)}
              disabled={deletingId === p.id}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
