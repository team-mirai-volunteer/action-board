"use client";

import PosterMap from "@/app/map/poster/PosterMap";
import type { Database } from "@/lib/types/supabase";
import { toast } from "sonner";

type PosterBoard = Database["public"]["Tables"]["poster_boards"]["Row"];

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
    <div className="h-full w-full" style={{ minHeight: "600px" }}>
      <PosterMap
        boards={boards}
        center={center}
        onBoardClick={handleBoardClick}
      />
    </div>
  );
}
