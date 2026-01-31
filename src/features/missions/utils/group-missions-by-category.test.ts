import { groupMissionsByCategory } from "@/features/missions/utils/group-missions-by-category";
import type { Database } from "@/lib/types/supabase";
import { describe, expect, it } from "@jest/globals";

type MissionCategoryView =
  Database["public"]["Views"]["mission_category_view"]["Row"];

// テスト用のミッションデータを作成するヘルパー関数
function createMissionCategoryView(
  overrides: Partial<MissionCategoryView> = {},
): MissionCategoryView {
  return {
    mission_id: "mission-1",
    slug: "mission-1",
    category_id: "category-1",
    category_title: "カテゴリ1",
    category_kbn: null,
    title: "ミッション1",
    content: "コンテンツ",
    difficulty: 1,
    icon_url: null,
    artifact_label: null,
    max_achievement_count: null,
    event_date: null,
    is_featured: false,
    is_hidden: false,
    ogp_image_url: null,
    required_artifact_type: "NONE",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    link_sort_no: 1,
    category_sort_no: 1,
    ...overrides,
  };
}

describe("groupMissionsByCategory", () => {
  describe("カテゴリごとのグループ化", () => {
    it("ミッションをカテゴリごとにグループ化する", () => {
      const data: MissionCategoryView[] = [
        createMissionCategoryView({
          mission_id: "m1",
          category_id: "c1",
          category_title: "カテゴリ1",
        }),
        createMissionCategoryView({
          mission_id: "m2",
          category_id: "c1",
          category_title: "カテゴリ1",
        }),
        createMissionCategoryView({
          mission_id: "m3",
          category_id: "c2",
          category_title: "カテゴリ2",
        }),
      ];

      const result = groupMissionsByCategory(data, new Map(), {
        showAchievedMissions: true,
        achievedMissionIds: [],
      });

      expect(result).toHaveLength(2);
      expect(result.find((c) => c.categoryId === "c1")?.missions).toHaveLength(
        2,
      );
      expect(result.find((c) => c.categoryId === "c2")?.missions).toHaveLength(
        1,
      );
    });

    it("category_idがnullのミッションをスキップする", () => {
      const data: MissionCategoryView[] = [
        createMissionCategoryView({
          mission_id: "m1",
          category_id: "c1",
          category_title: "カテゴリ1",
        }),
        createMissionCategoryView({
          mission_id: "m2",
          category_id: null,
          category_title: null,
        }),
      ];

      const result = groupMissionsByCategory(data, new Map(), {
        showAchievedMissions: true,
        achievedMissionIds: [],
      });

      expect(result).toHaveLength(1);
      expect(result[0].missions).toHaveLength(1);
    });

    it("カテゴリタイトルを正しく設定する", () => {
      const data: MissionCategoryView[] = [
        createMissionCategoryView({
          mission_id: "m1",
          category_id: "c1",
          category_title: "テストカテゴリ",
        }),
      ];

      const result = groupMissionsByCategory(data, new Map(), {
        showAchievedMissions: true,
        achievedMissionIds: [],
      });

      expect(result[0].categoryTitle).toBe("テストカテゴリ");
    });
  });

  describe("ソート", () => {
    it("link_sort_noでソートする", () => {
      const data: MissionCategoryView[] = [
        createMissionCategoryView({
          mission_id: "m1",
          category_id: "c1",
          link_sort_no: 3,
        }),
        createMissionCategoryView({
          mission_id: "m2",
          category_id: "c1",
          link_sort_no: 1,
        }),
        createMissionCategoryView({
          mission_id: "m3",
          category_id: "c1",
          link_sort_no: 2,
        }),
      ];

      const result = groupMissionsByCategory(data, new Map(), {
        showAchievedMissions: true,
        achievedMissionIds: [],
      });

      const missionIds = result[0].missions.map((m) => m.id);
      expect(missionIds).toEqual(["m2", "m3", "m1"]);
    });

    it("上限まで達成済みのミッションを後ろに移動する", () => {
      const data: MissionCategoryView[] = [
        createMissionCategoryView({
          mission_id: "m1",
          category_id: "c1",
          max_achievement_count: 1,
          link_sort_no: 1,
        }),
        createMissionCategoryView({
          mission_id: "m2",
          category_id: "c1",
          max_achievement_count: 1,
          link_sort_no: 2,
        }),
        createMissionCategoryView({
          mission_id: "m3",
          category_id: "c1",
          max_achievement_count: null,
          link_sort_no: 3,
        }),
      ];

      // m1は達成済み（上限到達）
      const userAchievementCountMap = new Map([["m1", 1]]);

      const result = groupMissionsByCategory(data, userAchievementCountMap, {
        showAchievedMissions: true,
        achievedMissionIds: ["m1"],
      });

      const missionIds = result[0].missions.map((m) => m.id);
      // m1は上限到達なので後ろに移動
      expect(missionIds).toEqual(["m2", "m3", "m1"]);
    });

    it("mission_idがnullの場合はソート順を維持する", () => {
      const data: MissionCategoryView[] = [
        createMissionCategoryView({
          mission_id: null,
          category_id: "c1",
          link_sort_no: 1,
        }),
        createMissionCategoryView({
          mission_id: "m1",
          category_id: "c1",
          link_sort_no: 2,
        }),
      ];

      const result = groupMissionsByCategory(data, new Map(), {
        showAchievedMissions: true,
        achievedMissionIds: [],
      });

      // mission_idがnullのものはフィルタリングで除外される
      expect(result[0].missions).toHaveLength(1);
      expect(result[0].missions[0].id).toBe("m1");
    });
  });

  describe("フィルタリング", () => {
    it("showAchievedMissionsがfalseの場合、達成済みミッションを除外する", () => {
      const data: MissionCategoryView[] = [
        createMissionCategoryView({
          mission_id: "m1",
          category_id: "c1",
        }),
        createMissionCategoryView({
          mission_id: "m2",
          category_id: "c1",
        }),
        createMissionCategoryView({
          mission_id: "m3",
          category_id: "c1",
        }),
      ];

      const result = groupMissionsByCategory(
        data,
        new Map([
          ["m1", 1],
          ["m2", 1],
        ]),
        { showAchievedMissions: false, achievedMissionIds: ["m1", "m2"] },
      );

      expect(result[0].missions).toHaveLength(1);
      expect(result[0].missions[0].id).toBe("m3");
    });

    it("showAchievedMissionsがtrueの場合、達成済みミッションも含める", () => {
      const data: MissionCategoryView[] = [
        createMissionCategoryView({
          mission_id: "m1",
          category_id: "c1",
        }),
        createMissionCategoryView({
          mission_id: "m2",
          category_id: "c1",
        }),
      ];

      const result = groupMissionsByCategory(data, new Map([["m1", 1]]), {
        showAchievedMissions: true,
        achievedMissionIds: ["m1"],
      });

      expect(result[0].missions).toHaveLength(2);
    });

    it("mission_idがnullのミッションを除外する", () => {
      const data: MissionCategoryView[] = [
        createMissionCategoryView({
          mission_id: "m1",
          category_id: "c1",
        }),
        createMissionCategoryView({
          mission_id: null,
          category_id: "c1",
        }),
      ];

      const result = groupMissionsByCategory(data, new Map(), {
        showAchievedMissions: true,
        achievedMissionIds: [],
      });

      expect(result[0].missions).toHaveLength(1);
    });
  });

  describe("変換処理", () => {
    it("MissionCategoryViewをMissionForComponent型に変換する", () => {
      const data: MissionCategoryView[] = [
        createMissionCategoryView({
          mission_id: "m1",
          category_id: "c1",
          title: "テストミッション",
          content: "テストコンテンツ",
          difficulty: 3,
          icon_url: "https://example.com/icon.png",
          artifact_label: "成果物ラベル",
          max_achievement_count: 5,
          event_date: "2024-06-01",
          is_featured: true,
          is_hidden: false,
          ogp_image_url: "https://example.com/ogp.png",
          required_artifact_type: "IMAGE",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-02T00:00:00Z",
        }),
      ];

      const result = groupMissionsByCategory(data, new Map(), {
        showAchievedMissions: true,
        achievedMissionIds: [],
      });

      const mission = result[0].missions[0];
      expect(mission.id).toBe("m1");
      expect(mission.title).toBe("テストミッション");
      expect(mission.content).toBe("テストコンテンツ");
      expect(mission.difficulty).toBe(3);
      expect(mission.icon_url).toBe("https://example.com/icon.png");
      expect(mission.artifact_label).toBe("成果物ラベル");
      expect(mission.max_achievement_count).toBe(5);
      expect(mission.event_date).toBe("2024-06-01");
      expect(mission.is_featured).toBe(true);
      expect(mission.is_hidden).toBe(false);
      expect(mission.ogp_image_url).toBe("https://example.com/ogp.png");
      expect(mission.required_artifact_type).toBe("IMAGE");
      expect(mission.created_at).toBe("2024-01-01T00:00:00Z");
      expect(mission.updated_at).toBe("2024-01-02T00:00:00Z");
      expect(mission.featured_importance).toBeNull();
    });

    it("nullの値にデフォルト値を設定する", () => {
      const data: MissionCategoryView[] = [
        createMissionCategoryView({
          mission_id: "m1",
          category_id: "c1",
          title: null,
          content: null,
          difficulty: null,
          is_featured: null,
          is_hidden: null,
          required_artifact_type: null,
          created_at: null,
          updated_at: null,
        }),
      ];

      const result = groupMissionsByCategory(data, new Map(), {
        showAchievedMissions: true,
        achievedMissionIds: [],
      });

      const mission = result[0].missions[0];
      expect(mission.title).toBe("");
      expect(mission.content).toBe("");
      expect(mission.difficulty).toBe(1);
      expect(mission.is_featured).toBe(false);
      expect(mission.is_hidden).toBe(false);
      expect(mission.required_artifact_type).toBe("");
      // created_at, updated_atはnewDate().toISOString()が設定される
      expect(mission.created_at).toBeDefined();
      expect(mission.updated_at).toBeDefined();
    });
  });

  describe("空のデータ", () => {
    it("空の配列を渡すと空の結果を返す", () => {
      const result = groupMissionsByCategory([], new Map(), {
        showAchievedMissions: true,
        achievedMissionIds: [],
      });

      expect(result).toHaveLength(0);
    });
  });
});
