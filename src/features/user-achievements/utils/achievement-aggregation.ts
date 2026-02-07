import type { MissionAchievementSummary } from "../types/achievement-types";

/**
 * 達成データの生レコード型（Supabaseリレーション結果）
 */
export interface RawAchievementRecord {
  mission_id: string | null;
  missions: {
    id: string;
    slug: string;
    title: string;
    max_achievement_count: number | null;
  } | null;
}

/**
 * 達成データをミッション別に集計し、MissionAchievementSummary配列を返す
 */
export function aggregateAchievementCounts(
  data: RawAchievementRecord[],
): MissionAchievementSummary[] {
  const achievementCounts = data.reduce(
    (acc, achievement) => {
      const missionId = achievement.mission_id;
      if (!missionId || !achievement.missions) return acc;

      if (!acc[missionId]) {
        acc[missionId] = {
          mission_id: missionId,
          mission_slug: achievement.missions.slug,
          mission_title: achievement.missions.title,
          achievement_count: 0,
        };
      }
      acc[missionId].achievement_count += 1;
      return acc;
    },
    {} as Record<string, MissionAchievementSummary>,
  );

  return Object.values(achievementCounts).filter(
    (achievement) => achievement.achievement_count > 0,
  );
}

/**
 * 達成データからMap<mission_id, count>を構築する
 */
export function buildAchievementMap(
  achievements: { mission_id: string | null }[],
): Map<string, number> {
  const achievementMap = new Map<string, number>();
  for (const achievement of achievements) {
    if (achievement.mission_id) {
      const current = achievementMap.get(achievement.mission_id) ?? 0;
      achievementMap.set(achievement.mission_id, current + 1);
    }
  }
  return achievementMap;
}
