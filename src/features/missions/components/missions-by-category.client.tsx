"use client";

import { useMemo, useState } from "react";
import { HorizontalScrollContainer } from "./horizontal-scroll-container";
import Mission from "./mission-card";

type MissionData = {
  id: string;
  title: string;
  icon_url: string | null;
  difficulty: number;
  content: string;
  created_at: string;
  artifact_label: string | null;
  max_achievement_count: number | null;
  event_date: string | null;
  is_featured: boolean;
  updated_at: string;
  is_hidden: boolean;
  ogp_image_url: string | null;
  required_artifact_type: string;
  featured_importance: number | null;
};

type CategoryData = {
  category_id: string;
  category_title: string;
  missions: MissionData[];
};

export default function MissionsByCategoryClient({
  categories,
  achievementCountList,
  userAchievementCounts,
}: {
  categories: CategoryData[];
  achievementCountList: [string, number][];
  userAchievementCounts: [string, number][];
}) {
  const [onlyUnAchieved, setOnlyUnAchieved] = useState(false);

  const globalAchievementMap = useMemo(
    () => new Map(achievementCountList),
    [achievementCountList],
  );

  const userAchievementCountMap = useMemo(
    () => new Map(userAchievementCounts),
    [userAchievementCounts],
  );

  const filteredCategories = useMemo(() => {
    if (!onlyUnAchieved) return categories;

    return categories
      .map((category) => ({
        ...category,
        missions: category.missions.filter(
          (mission) => !userAchievementCountMap.has(mission.id),
        ),
      }))
      .filter((category) => category.missions.length > 0);
  }, [categories, onlyUnAchieved, userAchievementCountMap]);

  return (
    <div className="flex flex-col gap-11">
      <h2 className="text-center md:text-4xl my-5">📈 ミッション</h2>

      <div className="flex justify-center">
        <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm cursor-pointer transition">
          <input
            type="checkbox"
            checked={onlyUnAchieved}
            onChange={(e) => setOnlyUnAchieved(e.target.checked)}
            className="w-4 h-4 accent-blue-600 cursor-pointer"
          />
          <span className="font-medium">未達成ミッションのみ表示</span>
        </label>
      </div>

      {filteredCategories.map((category) => (
        <section
          key={category.category_id}
          className="relative w-screen md:pl-10"
        >
          <h3 className="text-xl font-bold">{category.category_title}</h3>
          <HorizontalScrollContainer>
            <div className="flex w-fit gap-4 px-4 pb-2 pt-4">
              {category.missions.map((mission) => (
                <div key={mission.id} className="flex-shrink-0 w-[300px]">
                  <Mission
                    mission={mission}
                    achievementsCount={
                      globalAchievementMap.get(mission.id) ?? 0
                    }
                    userAchievementCount={
                      userAchievementCountMap.get(mission.id) ?? 0
                    }
                  />
                </div>
              ))}
            </div>
          </HorizontalScrollContainer>
        </section>
      ))}
    </div>
  );
}
