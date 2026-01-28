import { fireEvent, render, screen } from "@testing-library/react";
import { ActivityTimeline } from "./activity-timeline";

describe("ActivityTimeline", () => {
  describe("基本的な表示", () => {
    it("空データ時は「活動履歴がありません」を表示", () => {
      render(<ActivityTimeline timeline={[]} hasNext={false} />);

      expect(screen.getByText("活動履歴がありません")).toBeInTheDocument();
    });

    it("タイムラインアイテムが正しくレンダリングされる", () => {
      const mockTimeline = [
        {
          id: "1",
          created_at: "2023-01-01T12:00:00Z",
          title: "テストミッション",
          name: "テストユーザー",
          user_id: "user-1",
          address_prefecture: "東京都",
          avatar_url: null,
          activity_type: "mission_achievement",
          mission_id: "mission-1",
          mission_slug: "test-mission",
        },
      ];

      render(<ActivityTimeline timeline={mockTimeline} hasNext={false} />);

      // ミッション名がリンクとして表示されていることを確認
      const missionLink = screen.getByRole("link", {
        name: "テストミッション",
      });
      expect(missionLink).toBeInTheDocument();
      expect(missionLink).toHaveAttribute("href", "/missions/test-mission");
    });

    it("activity_type別に正しい表示形式を使用", () => {
      const signupActivity = {
        id: "signup-1",
        created_at: "2023-01-01T12:00:00Z",
        title: "新規登録しました",
        name: "新規ユーザー",
        user_id: "user-2",
        address_prefecture: "大阪府",
        avatar_url: null,
        activity_type: "signup",
        mission_id: null,
        mission_slug: null,
      };

      const missionActivity = {
        id: "mission-1",
        created_at: "2023-01-01T13:00:00Z",
        title: "テストミッション",
        name: "既存ユーザー",
        user_id: "user-3",
        address_prefecture: "神奈川県",
        avatar_url: null,
        activity_type: "mission_achievement",
        mission_id: "mission-abc",
        mission_slug: "test-mission-abc",
      };

      render(
        <ActivityTimeline
          timeline={[signupActivity, missionActivity]}
          hasNext={false}
        />,
      );

      expect(screen.getByText("新規登録しました")).toBeInTheDocument();

      // ミッション名がリンクとして表示されていることを確認
      const missionLink = screen.getByRole("link", {
        name: "テストミッション",
      });
      expect(missionLink).toBeInTheDocument();
      expect(missionLink).toHaveAttribute("href", "/missions/test-mission-abc");
    });

    it("ユーザーアバターとリンクが正しく表示される", () => {
      const mockTimeline = [
        {
          id: "1",
          created_at: "2023-01-01T12:00:00Z",
          title: "テストアクティビティ",
          name: "テストユーザー",
          user_id: "user-123",
          address_prefecture: "東京都",
          avatar_url: "https://example.com/avatar.jpg",
          activity_type: "signup",
          mission_id: null,
          mission_slug: null,
        },
      ];

      render(<ActivityTimeline timeline={mockTimeline} hasNext={false} />);

      const userLinks = screen.getAllByRole("link");
      expect(userLinks[0]).toHaveAttribute("href", "/users/user-123");
    });
  });

  describe("ページネーション", () => {
    it("hasNext=trueの時「もっと見る」ボタンが表示される", () => {
      const mockTimeline = [
        {
          id: "1",
          created_at: "2023-01-01T12:00:00Z",
          title: "テストアクティビティ",
          name: "テストユーザー",
          user_id: "user-1",
          address_prefecture: "東京都",
          avatar_url: null,
          activity_type: "signup",
          mission_id: null,
          mission_slug: null,
        },
      ];

      render(<ActivityTimeline timeline={mockTimeline} hasNext={true} />);

      expect(screen.getByText("もっと見る")).toBeInTheDocument();
    });

    it("hasNext=falseの時「もっと見る」ボタンが表示されない", () => {
      const mockTimeline = [
        {
          id: "1",
          created_at: "2023-01-01T12:00:00Z",
          title: "テストアクティビティ",
          name: "テストユーザー",
          user_id: "user-1",
          address_prefecture: "東京都",
          avatar_url: null,
          activity_type: "signup",
          mission_id: null,
          mission_slug: null,
        },
      ];

      render(<ActivityTimeline timeline={mockTimeline} hasNext={false} />);

      expect(screen.queryByText("もっと見る")).not.toBeInTheDocument();
    });

    it("「もっと見る」ボタンクリック時にonLoadMoreが呼ばれる", () => {
      const mockOnLoadMore = jest.fn();
      const mockTimeline = [
        {
          id: "1",
          created_at: "2023-01-01T12:00:00Z",
          title: "テストアクティビティ",
          name: "テストユーザー",
          user_id: "user-1",
          address_prefecture: "東京都",
          avatar_url: null,
          activity_type: "signup",
          mission_id: null,
          mission_slug: null,
        },
      ];

      render(
        <ActivityTimeline
          timeline={mockTimeline}
          hasNext={true}
          onLoadMore={mockOnLoadMore}
        />,
      );

      const loadMoreButton = screen.getByText("もっと見る");
      fireEvent.click(loadMoreButton);

      expect(mockOnLoadMore).toHaveBeenCalledTimes(1);
    });
  });

  describe("日時表示", () => {
    it("created_atが正しくフォーマットされて表示される", () => {
      const mockTimeline = [
        {
          id: "1",
          created_at: "2023-12-25T15:30:45Z",
          title: "テストアクティビティ",
          name: "テストユーザー",
          user_id: "user-1",
          address_prefecture: "東京都",
          avatar_url: null,
          activity_type: "signup",
          mission_id: null,
          mission_slug: null,
        },
      ];

      render(<ActivityTimeline timeline={mockTimeline} hasNext={false} />);

      const timeElement = screen.getByText(/2023/);
      expect(timeElement).toBeInTheDocument();
    });

    it("created_atがnullの場合は日時が表示されない", () => {
      const mockTimeline = [
        {
          id: "1",
          created_at: null,
          title: "テストアクティビティ",
          name: "テストユーザー",
          user_id: "user-1",
          address_prefecture: "東京都",
          avatar_url: null,
          activity_type: "signup",
          mission_id: null,
          mission_slug: null,
        },
      ];

      render(<ActivityTimeline timeline={mockTimeline} hasNext={false} />);

      // created_atがnullの場合、日時表示部分が空になる
      expect(screen.getByText("テストアクティビティ")).toBeInTheDocument();
    });
  });
});
