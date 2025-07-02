"use client";

import type { Database } from "@/lib/types/supabase";
import dynamic from "next/dynamic";
import { toast } from "sonner";

type PosterBoard = Database["public"]["Tables"]["poster_boards"]["Row"];

const PosterMap = dynamic(() => import("./PosterMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <div>地図を読み込み中...</div>
    </div>
  ),
});

interface MapClientProps {
  boards: PosterBoard[];
  center: [number, number];
  zoom: number;
  userId?: string;
}

export function MapClient({ boards, center, zoom, userId }: MapClientProps) {
  const handleBoardClick = (board: PosterBoard) => {
    // For city-level view, just show info about the board
    toast.info(`${board.number ? `#${board.number} ` : ""}${board.name}`, {
      description: `${board.address}, ${board.city}`,
    });
  };

  return (
    <div className="h-full w-full min-h-[600px]">
      <PosterMap
        boards={boards}
        center={center}
        onBoardClick={handleBoardClick}
      />
    </div>
  );
}
