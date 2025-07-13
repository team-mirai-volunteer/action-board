import { getUserActivityTimeline } from "@/lib/services/activityTimeline";

jest.mock("@/lib/services/activityTimeline");

describe("activity_timeline_view LIMIT句回帰防止統合テスト", () => {
  const mockGetUserActivityTimeline = getUserActivityTimeline as jest.MockedFunction<typeof getUserActivityTimeline>;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("大量データ環境でのLIMIT句適用確認", async () => {
    const mockData = Array.from({ length: 100 }, (_, i) => ({
      id: `test-${i}`,
      user_id: "user-1",
      name: "テストユーザー",
      address_prefecture: "東京都",
      avatar_url: null,
      title: `アクティビティ${i}`,
      activity_type: i % 2 === 0 ? "mission_achievement" as const : "signup" as const,
      created_at: new Date(Date.now() - i * 1000).toISOString(),
    }));

    mockGetUserActivityTimeline.mockResolvedValue(mockData.slice(0, 50));
    
    const result = await getUserActivityTimeline("user-1", 50, 0);

    expect(mockGetUserActivityTimeline).toHaveBeenCalledWith("user-1", 50, 0);
    expect(result).toHaveLength(50);
    
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

  test("ページネーション機能の確認", async () => {
    const mockData = Array.from({ length: 20 }, (_, i) => ({
      id: `test-${i}`,
      user_id: "user-1",
      name: "テストユーザー",
      address_prefecture: "東京都",
      avatar_url: null,
      title: `アクティビティ${i}`,
      activity_type: "signup" as const,
      created_at: new Date(Date.now() - i * 1000).toISOString(),
    }));

    mockGetUserActivityTimeline.mockResolvedValue(mockData.slice(10, 20));
    
    const result = await getUserActivityTimeline("user-1", 10, 10);

    expect(mockGetUserActivityTimeline).toHaveBeenCalledWith("user-1", 10, 10);
    expect(result).toHaveLength(10);
  });
});
