"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HEADER_HEIGHT } from "@/lib/constants/layout";
import type { CityStats } from "../types/poster-tracking-types";
import { PosterTrackingInputMap } from "./poster-tracking-input-map";
import { PosterTrackingStatsMap } from "./poster-tracking-stats-map";

interface PosterTrackingPageClientProps {
  userId: string | null;
  initialStats: CityStats[];
}

export function PosterTrackingPageClient({
  userId,
  initialStats,
}: PosterTrackingPageClientProps) {
  return (
    <div
      style={{
        height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Tabs
        defaultValue={userId ? "register" : "stats"}
        className="flex flex-col flex-1"
      >
        <div className="flex justify-center bg-white border-b px-4 py-1">
          <TabsList>
            {userId && <TabsTrigger value="register">登録</TabsTrigger>}
            <TabsTrigger value="stats">集計</TabsTrigger>
          </TabsList>
        </div>

        {userId && (
          <TabsContent value="register" className="flex-1 relative m-0">
            <PosterTrackingInputMap userId={userId} />
          </TabsContent>
        )}

        <TabsContent value="stats" className="flex-1 relative m-0">
          <PosterTrackingStatsMap initialStats={initialStats} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
