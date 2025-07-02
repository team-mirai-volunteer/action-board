"use client";

import type { Database } from "@/lib/types/supabase";
import dynamic from "next/dynamic";
import { toast } from "sonner";

type PosterBoard = Database["public"]["Tables"]["poster_boards"]["Row"];

const PosterMap = dynamic(() => import("@/app/map/poster/PosterMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] items-center justify-center">
      地図を読み込み中...
    </div>
  ),
});

interface CityPosterMapClientProps {
  boards: PosterBoard[];
  center: [number, number];
  zoom: number;
  userId?: string;
}

export function CityPosterMapClient({
  boards,
  center,
  zoom,
  userId,
}: CityPosterMapClientProps) {
  const handleBoardClick = (board: PosterBoard) => {
    // For city-level view, just show info about the board
    toast.info(`${board.number ? `#${board.number} ` : ""}${board.name}`, {
      description: `${board.address}, ${board.city}`,
    });
  };

  return (
    <PosterMap
      boards={boards}
      center={center}
      onBoardClick={handleBoardClick}
    />
  );
}
