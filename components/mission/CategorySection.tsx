"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import type { Tables } from "@/lib/types/supabase";
import { UsersRound } from "lucide-react";
import React from "react";

type MissionWithCounts = Tables<"missions"> & {
  achievementsCount: number;
  userAchievementCount: number;
  achieved: boolean;
};

interface CategorySectionProps {
  categoryTitle: string;
  missions: MissionWithCounts[];
}

export default function CategorySection({
  categoryTitle,
  missions,
}: CategorySectionProps) {
  if (!missions.length) return null;

  return (
    <section className="w-full px-4 py-6 overflow-hidden">
      {/* タイトル（画面幅内） */}
      <h2 className="text-xl font-bold mb-4">? {categoryTitle}</h2>

      {/* カードだけ横スクロール - 画面幅を超えないようにoverflow制御 */}
      <div className="-mx-4 px-4 overflow-x-auto snap-x snap-mandatory">
        <div className="flex gap-4 w-max">
          {/* 内側の幅は必要に応じて広がるように w-max */}
          {missions.map((mission) => (
            <Card
              key={mission.id}
              className="min-w-[280px] max-w-[280px] shrink-0 snap-start"
            >
              <CardContent className="p-4">
                <p className="text-sm font-medium">{mission.title}</p>
                <div className="mt-2 text-xs text-muted-foreground">
                  難易度 <DifficultyBadge difficulty={mission.difficulty} />{" "}
                  ポイント
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                  <UsersRound className="size-3" />
                  みんなで {mission.achievementsCount.toLocaleString()} 回達成
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
