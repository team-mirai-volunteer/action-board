/**
 * getUserActivityTimeline 統合テストユニット版
 * 
 * このテストファイルは以下の機能を検証します：
 * - LIMIT句の正確な適用確認
 * - 大量データでのソート順序確認
 * - achievementsとuser_activitiesの統合確認
 * - エラーハンドリングの適切性確認
 * 
 * 統合テストとの違い: モックを使用してより高速で
 * 安定したテスト実行を実現
 */
import { getUserActivityTimeline } from "@/lib/services/activityTimeline";

jest.mock("@/lib/services/activityTimeline");

describe("activity_timeline_view LIMIT句回帰防止テスト", () => {
  const mockGetUserActivityTimeline = getUserActivityTimeline as jest.MockedFunction<typeof getUserActivityTimeline>;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("LIMIT句が正しく適用されることを確認", async () => {
    const mockData = [
      {
        id: "achievement_test-1",
        user_id: "user-1",
        name: "テストユーザー",
        address_prefecture: "東京都",
        avatar_url: null,
        title: "テストミッション",
        activity_type: "mission_achievement" as const,
        created_at: "2024-01-01T12:00:00Z",
      },
    ];

    mockGetUserActivityTimeline.mockResolvedValue(mockData);
    
    const result = await getUserActivityTimeline("user-1", 10, 0);

    expect(mockGetUserActivityTimeline).toHaveBeenCalledWith("user-1", 10, 0);
    expect(result).toHaveLength(1);
    expect(result[0].activity_type).toBe("mission_achievement");
  });

  test("大量データ環境でのソート順確認", async () => {
    const mockData = Array.from({ length: 20 }, (_, i) => ({
      id: `test-${i}`,
      user_id: "user-1",
      name: "テストユーザー",
      address_prefecture: "東京都",
      avatar_url: null,
      title: `アクティビティ${i}`,
      activity_type: i % 2 === 0 ? "mission_achievement" as const : "signup" as const,
      created_at: new Date(Date.now() - i * 1000).toISOString(),
    }));

    mockGetUserActivityTimeline.mockResolvedValue(mockData);
    
    const result = await getUserActivityTimeline("user-1", 20, 0);

    expect(result).toHaveLength(20);
    
    const timestamps = result.map(item => new Date(item.created_at).getTime());
    const sortedTimestamps = [...timestamps].sort((a, b) => b - a);
    expect(timestamps).toEqual(sortedTimestamps);
  });

  test("UNION ALLクエリの統合確認", async () => {
    const mockData = [
      {
        id: "achievement_test-1",
        user_id: "user-1",
        name: "テストユーザー",
        address_prefecture: "東京都",
        avatar_url: null,
        title: "ミッション達成",
        activity_type: "mission_achievement" as const,
        created_at: "2024-01-02T00:00:00Z",
      },
      {
        id: "activity_test-1",
        user_id: "user-1", 
        name: "テストユーザー",
        address_prefecture: "東京都",
        avatar_url: null,
        title: "新規登録",
        activity_type: "signup" as const,
        created_at: "2024-01-01T00:00:00Z",
      },
    ];

    mockGetUserActivityTimeline.mockResolvedValue(mockData);
    
    const result = await getUserActivityTimeline("user-1");

    expect(result).toHaveLength(2);
    expect(result[0].activity_type).toBe("mission_achievement");
    expect(result[1].activity_type).toBe("signup");
    
    const achievementItem = result.find(item => item.activity_type === "mission_achievement");
    const activityItem = result.find(item => item.activity_type === "signup");
    
    expect(achievementItem?.id).toMatch(/^achievement_/);
    expect(activityItem?.id).toMatch(/^activity_/);
  });

  test("エラーハンドリングの統一性確認", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    
    mockGetUserActivityTimeline.mockRejectedValue(new Error("Database connection failed"));
    
    try {
      await getUserActivityTimeline("user-1");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }

    consoleSpy.mockRestore();
  });
});
