"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Tables } from "@/lib/types/supabase";
import React from "react";
import Missions from "./Missions";

type MissionsByCategoryProps = {
  missions: Tables<"missions">[];
  userAchievements?: Record<string, number>;
  totalAchievements?: Record<string, number>;
};

export function MissionsByCategory({
  missions,
  userAchievements,
  totalAchievements,
}: MissionsByCategoryProps) {
  const missionsByCategory = missions.reduce(
    (acc, mission) => {
      const category = `難易度 ${mission.difficulty}`;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(mission);
      return acc;
    },
    {} as Record<string, Tables<"missions">[]>,
  );

  const categories = Object.keys(missionsByCategory).sort();

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        ミッションがありません
      </div>
    );
  }

  if (categories.length === 1) {
    const category = categories[0];
    return (
      <Card>
        <CardHeader>
          <CardTitle>{category}</CardTitle>
        </CardHeader>
        <CardContent>
          <Missions
            missions={missionsByCategory[category]}
            userAchievements={userAchievements}
            totalAchievements={totalAchievements}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue={categories[0]} className="w-full">
      <TabsList className="grid w-full grid-cols-auto">
        {categories.map((category) => (
          <TabsTrigger key={category} value={category}>
            {category}
          </TabsTrigger>
        ))}
      </TabsList>
      {categories.map((category) => (
        <TabsContent key={category} value={category}>
          <Card>
            <CardHeader>
              <CardTitle>{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <Missions
                missions={missionsByCategory[category]}
                userAchievements={userAchievements}
                totalAchievements={totalAchievements}
              />
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
}
