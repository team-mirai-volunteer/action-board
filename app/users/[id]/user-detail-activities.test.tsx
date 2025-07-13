import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import UserDetailActivities from "./user-detail-activities";

global.fetch = jest.fn();

describe("UserDetailActivities", () => {
  const mockProps = {
    initialTimeline: [
      {
        id: "initial-1",
        user_id: "user-123",
        name: "テストユーザー",
        address_prefecture: "東京都",
        avatar_url: null,
        title: "初期アクティビティ",
        created_at: "2024-01-01T00:00:00Z",
        activity_type: "signup",
      },
    ],
    totalCount: 5,
    pageSize: 2,
    userId: "user-123",
  };

  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it("初期データを正しく表示する", () => {
    render(<UserDetailActivities {...mockProps} />);

    expect(screen.getByText("初期アクティビティ")).toBeInTheDocument();
  });

  it("初期状態でhasNextが正しく設定される", () => {
    render(<UserDetailActivities {...mockProps} />);

    expect(screen.getByText("もっと見る")).toBeInTheDocument();
  });

  it("totalCountがinitialTimeline以下の場合hasNext=false", () => {
    const propsWithNoNext = {
      ...mockProps,
      totalCount: 1, // initialTimeline.lengthと同じ
    };

    render(<UserDetailActivities {...propsWithNoNext} />);

    expect(screen.queryByText("もっと見る")).not.toBeInTheDocument();
  });

  it("handleLoadMoreでAPIを呼び出してデータを追加", async () => {
    const mockNewTimeline = [
      {
        id: "new-1",
        user_id: "user-123",
        name: "テストユーザー",
        address_prefecture: "東京都",
        avatar_url: null,
        title: "追加アクティビティ1",
        created_at: "2024-01-02T00:00:00Z",
        activity_type: "mission_achievement",
      },
      {
        id: "new-2",
        user_id: "user-123",
        name: "テストユーザー",
        address_prefecture: "東京都",
        avatar_url: null,
        title: "追加アクティビティ2",
        created_at: "2024-01-03T00:00:00Z",
        activity_type: "signup",
      },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ timeline: mockNewTimeline }),
    });

    render(<UserDetailActivities {...mockProps} />);

    const loadMoreButton = screen.getByText("もっと見る");
    fireEvent.click(loadMoreButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/users/user-123/activity-timeline?limit=2&offset=1",
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText(
          "東京都のテストユーザーさんが「追加アクティビティ1」を達成しました！",
        ),
      ).toBeInTheDocument();
      expect(screen.getByText("追加アクティビティ2")).toBeInTheDocument();
    });
  });

  it("APIレスポンスでhasNextが正しく更新される", async () => {
    const mockNewTimeline = [
      {
        id: "new-1",
        user_id: "user-123",
        name: "テストユーザー",
        address_prefecture: "東京都",
        avatar_url: null,
        title: "追加アクティビティ",
        created_at: "2024-01-02T00:00:00Z",
        activity_type: "mission_achievement",
      },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ timeline: mockNewTimeline }),
    });

    const propsWithLimitedTotal = {
      ...mockProps,
      totalCount: 2, // initial(1) + new(1) = 2で上限に達する
    };

    render(<UserDetailActivities {...propsWithLimitedTotal} />);

    const loadMoreButton = screen.getByText("もっと見る");
    fireEvent.click(loadMoreButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          "東京都のテストユーザーさんが「追加アクティビティ」を達成しました！",
        ),
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.queryByText("もっと見る")).not.toBeInTheDocument();
    });
  });

  it("APIエラー時はconsole.errorでログ出力", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<UserDetailActivities {...mockProps} />);

    const loadMoreButton = screen.getByText("もっと見る");
    fireEvent.click(loadMoreButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to load more activities:",
        expect.any(Error),
      );
    });

    consoleSpy.mockRestore();
  });

  it("ネットワークエラー時もconsole.errorでログ出力", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    render(<UserDetailActivities {...mockProps} />);

    const loadMoreButton = screen.getByText("もっと見る");
    fireEvent.click(loadMoreButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to load more activities:",
        expect.any(Error),
      );
    });

    consoleSpy.mockRestore();
  });

  it("空のレスポンスの場合は状態が変更されない", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ timeline: [] }),
    });

    render(<UserDetailActivities {...mockProps} />);

    const loadMoreButton = screen.getByText("もっと見る");
    fireEvent.click(loadMoreButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    expect(screen.getByText("初期アクティビティ")).toBeInTheDocument();
    expect(screen.getByText("もっと見る")).toBeInTheDocument();
  });

  it("ページネーション制御が正しく動作", () => {
    const propsWithManyItems = {
      ...mockProps,
      initialTimeline: [
        {
          id: "item-1",
          user_id: "user-123",
          name: "テストユーザー",
          address_prefecture: "東京都",
          avatar_url: null,
          title: "アイテム1",
          created_at: "2024-01-01T00:00:00Z",
          activity_type: "signup",
        },
        {
          id: "item-2",
          user_id: "user-123",
          name: "テストユーザー",
          address_prefecture: "東京都",
          avatar_url: null,
          title: "アイテム2",
          created_at: "2024-01-02T00:00:00Z",
          activity_type: "mission_achievement",
        },
      ],
      totalCount: 10,
    };

    render(<UserDetailActivities {...propsWithManyItems} />);

    expect(screen.getByText("もっと見る")).toBeInTheDocument();
    expect(screen.getByText("アイテム1")).toBeInTheDocument();
    expect(
      screen.getByText(
        "東京都のテストユーザーさんが「アイテム2」を達成しました！",
      ),
    ).toBeInTheDocument();
  });
});
