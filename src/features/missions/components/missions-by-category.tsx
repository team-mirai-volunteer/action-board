import { createClient } from "@/lib/supabase/client";
import type { MissionsProps } from "./mission-list";
import MissionsByCategoryClient from "./missions-by-category.client";

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

type CategoryGroup = {
  category_id: string;
  category_title: string;
  category_sort_no: number;
  missions: MissionData[];
};

export default async function MissionsByCategory({
  userId,
}: Pick<MissionsProps, "userId">) {
  const supabase = createClient();

  // ユーザー達成状況（アプリ側集計）
  const { data: achievements } = userId
    ? await supabase
        .from("achievements")
        .select("mission_id")
        .eq("user_id", userId)
    : { data: [] };

  // ユーザー達成回数を集計してtuple配列に変換
  const userAchievementCountMap = (achievements ?? [])
    .filter((a): a is { mission_id: string } => a.mission_id != null)
    .reduce<Map<string, number>>((map, a) => {
      map.set(a.mission_id, (map.get(a.mission_id) ?? 0) + 1);
      return map;
    }, new Map());

  const userAchievementCounts: [string, number][] = Array.from(
    userAchievementCountMap.entries(),
  );

  // 全体達成人数
  const { data: achievementCounts } = await supabase
    .from("mission_achievement_count_view")
    .select("mission_id, achievement_count");

  // null除外してフィルタリング
  const achievementCountList: [string, number][] = (achievementCounts ?? [])
    .filter(
      (a): a is { mission_id: string; achievement_count: number } =>
        a.mission_id != null && a.achievement_count != null,
    )
    .map((a) => [a.mission_id, a.achievement_count]);

  // ミッション一覧（カテゴリ付き）
  const { data, error } = await supabase
    .from("mission_category_view")
    .select(`
      category_id,
      category_title,
      category_kbn,
      category_sort_no,
      mission_id,
      title,
      icon_url,
      difficulty,
      content,
      created_at,
      artifact_label,
      max_achievement_count,
      event_date,
      is_featured,
      updated_at,
      is_hidden,
      ogp_image_url,
      required_artifact_type,
      link_sort_no
    `)
    .order("category_sort_no", { ascending: true })
    .order("link_sort_no", { ascending: true });

  if (error || !data?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          ミッションが見つかりませんでした
        </p>
      </div>
    );
  }

  // カテゴリー別にグルーピング
  const grouped = data
    .filter(
      (row): row is typeof row & { category_id: string; mission_id: string } =>
        row.category_id != null && row.mission_id != null,
    )
    .reduce<Record<string, CategoryGroup>>((acc, row) => {
      const categoryId = row.category_id;
      const missionId = row.mission_id;

      if (!acc[categoryId]) {
        acc[categoryId] = {
          category_id: categoryId,
          category_title: row.category_title || "",
          category_sort_no: row.category_sort_no || 0,
          missions: [],
        };
      }

      acc[categoryId].missions.push({
        id: missionId,
        title: row.title || "",
        icon_url: row.icon_url,
        difficulty: row.difficulty || 1,
        content: row.content || "",
        created_at: row.created_at || new Date().toISOString(),
        artifact_label: row.artifact_label,
        max_achievement_count: row.max_achievement_count,
        event_date: row.event_date,
        is_featured: row.is_featured || false,
        updated_at: row.updated_at || new Date().toISOString(),
        is_hidden: row.is_hidden || false,
        ogp_image_url: row.ogp_image_url,
        required_artifact_type: row.required_artifact_type || "",
        featured_importance: null,
      });

      return acc;
    }, {});

  // 各カテゴリー内でミッションをソート（既に作成済みのMapを使用）
  for (const category of Object.values(grouped)) {
    category.missions.sort((a, b) => {
      const aCount = userAchievementCountMap.get(a.id) ?? 0;
      const bCount = userAchievementCountMap.get(b.id) ?? 0;
      const aMax = a.max_achievement_count;
      const bMax = b.max_achievement_count;
      const aIsMaxAchieved = aMax && aCount >= aMax;
      const bIsMaxAchieved = bMax && bCount >= bMax;

      // 最大達成済みは後ろに
      if (aIsMaxAchieved && !bIsMaxAchieved) return 1;
      if (!aIsMaxAchieved && bIsMaxAchieved) return -1;

      // それ以外はlink_sort_no順（既にorderされているのでそのままの順序を保持）
      return 0;
    });
  }

  // カテゴリーをcategory_sort_no順に並べて配列化
  const categories = Object.values(grouped).sort(
    (a, b) => a.category_sort_no - b.category_sort_no,
  );

  return (
    <MissionsByCategoryClient
      categories={categories}
      achievementCountList={achievementCountList}
      userAchievementCounts={userAchievementCounts}
    />
  );
}
