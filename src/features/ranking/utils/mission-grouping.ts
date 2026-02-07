import type { Tables } from "@/lib/types/supabase";

export type MissionWithCategory = Tables<"missions"> & {
  mission_category_link: Array<{
    mission_category: {
      id: string;
      category_title: string | null;
      sort_no: number;
    } | null;
  }>;
};

interface CategoryGroup {
  category: string;
  missions: MissionWithCategory[];
  sortNo: number;
}

export interface GroupedMissions {
  sortedCategories: [string, CategoryGroup][];
  uncategorized: MissionWithCategory[];
}

/**
 * Group missions by their first linked category, sorted by sort_no.
 * Missions without a valid category are collected into `uncategorized`.
 */
export function groupMissionsByCategory(
  missions: MissionWithCategory[],
): GroupedMissions {
  const groups: Record<string, CategoryGroup> = {};
  const uncategorized: MissionWithCategory[] = [];

  for (const mission of missions) {
    const categoryLink = mission.mission_category_link?.[0];
    const category = categoryLink?.mission_category;

    if (category?.category_title) {
      const key = category.id;
      if (!groups[key]) {
        groups[key] = {
          category: category.category_title,
          missions: [],
          sortNo: category.sort_no,
        };
      }
      groups[key].missions.push(mission);
    } else {
      uncategorized.push(mission);
    }
  }

  // カテゴリを sort_no でソート
  const sortedCategories = Object.entries(groups).sort(
    ([, a], [, b]) => a.sortNo - b.sortNo,
  );

  return { sortedCategories, uncategorized };
}
