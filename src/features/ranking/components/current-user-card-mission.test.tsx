import { render, screen } from "@testing-library/react";
import type React from "react";
import { CurrentUserCardMission } from "./current-user-card-mission";

const mockUserNameWithBadge = jest.fn(
  ({ name, membership }: { name: string; membership?: unknown }) => (
    <span
      data-testid="user-name-with-badge"
      data-membership={JSON.stringify(membership)}
    >
      {name}
    </span>
  ),
);

jest.mock(
  "@/features/party-membership/components/user-name-with-badge",
  () => ({
    UserNameWithBadge: (props: unknown) =>
      mockUserNameWithBadge(props as { name: string; membership?: unknown }),
  }),
);

type Mission = {
  id: string;
  title: string;
  description: string;
  artifact_label?: string | null;
  content?: string | null;
  created_at?: string;
  difficulty?: number;
  event_date?: string | null;
  icon_url?: string | null;
  is_featured?: boolean;
  is_posting_mission?: boolean;
  location?: string | null;
  max_participants?: number | null;
  name?: string;
  updated_at?: string;
  is_hidden?: boolean;
  max_achievement_count?: number | null;
  ogp_image_url?: string | null;
  required_artifact_type?: string | null;
};

jest.mock("@/components/ui/card", () => ({
  Card: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <h2 className={className} data-testid="card-title">
      {children}
    </h2>
  ),
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <span className={className} data-testid="badge">
      {children}
    </span>
  ),
}));

jest.mock("@/features/ranking/utils/ranking-utils", () => ({
  formatUserDisplayName: (name: string) => name || "名前未設定",
  formatUserPrefecture: (prefecture: string) => prefecture || "未設定",
}));

jest.mock("lucide-react", () => ({
  User: ({ className }: { className?: string }) => (
    <div className={className} data-testid="user-icon" />
  ),
}));

const mockUser = {
  user_id: "test-user-1",
  name: "テストユーザー",
  address_prefecture: "東京都",
  rank: 3,
  total_points: 1500,
  user_achievement_count: 5,
  level: 10,
  updated_at: "2024-01-01T00:00:00Z",
  xp: 1000,
  party_membership: {
    plan: "starter" as const,
    badge_visibility: true,
    user_id: "test-user-1",
    synced_at: "2024-01-01T00:00:00Z",
    metadata: {},
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
} as any;

const mockMission = {
  id: "mission-1",
  title: "テストミッション",
  description: "テスト用のミッション",
  name: "テストミッション",
} as any;

describe("CurrentUserCardMission", () => {
  beforeEach(() => {
    mockUserNameWithBadge.mockClear();
  });

  describe("基本的な表示", () => {
    it("ユーザー情報が正しく表示される", () => {
      render(
        <CurrentUserCardMission
          currentUser={mockUser}
          mission={mockMission}
          badgeText="5回達成"
        />,
      );

      expect(screen.getByText("テストユーザー")).toBeInTheDocument();
      expect(screen.getByText("東京都")).toBeInTheDocument();
      expect(screen.getByText("1,500pt")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(mockUserNameWithBadge).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "テストユーザー",
          membership: mockUser.party_membership,
        }),
      );
    });

    it("タイトルが正しく表示される", () => {
      render(
        <CurrentUserCardMission
          currentUser={mockUser}
          mission={mockMission}
          badgeText="5回達成"
        />,
      );

      expect(screen.getByText("あなたのランク")).toBeInTheDocument();
      expect(screen.getByTestId("user-icon")).toBeInTheDocument();
    });

    it("バッジテキストが表示される", () => {
      render(
        <CurrentUserCardMission
          currentUser={mockUser}
          mission={mockMission}
          badgeText="10回達成"
        />,
      );

      expect(screen.getByText("10回達成")).toBeInTheDocument();
      expect(screen.getByTestId("badge")).toBeInTheDocument();
    });
  });

  describe("null値の処理", () => {
    it("currentUserがnullの場合は何も表示されない", () => {
      const { container } = render(
        <CurrentUserCardMission
          currentUser={null}
          mission={mockMission}
          badgeText="0回達成"
        />,
      );

      expect(container.firstChild).toBeNull();
    });

    it("rankがnullの場合は0が表示される", () => {
      const user = { ...mockUser, rank: null };
      render(
        <CurrentUserCardMission
          currentUser={user}
          mission={mockMission}
          badgeText="5回達成"
        />,
      );

      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("total_pointsがnullの場合は0ptが表示される", () => {
      const user = { ...mockUser, total_points: null };
      render(
        <CurrentUserCardMission
          currentUser={user}
          mission={mockMission}
          badgeText="5回達成"
        />,
      );

      expect(screen.getByText("0pt")).toBeInTheDocument();
    });
  });

  describe("コンポーネント構造", () => {
    it("カードの構造が正しい", () => {
      render(
        <CurrentUserCardMission
          currentUser={mockUser}
          mission={mockMission}
          badgeText="5回達成"
        />,
      );

      expect(screen.getByTestId("card-header")).toBeInTheDocument();
      expect(screen.getByTestId("card-content")).toBeInTheDocument();
      expect(screen.getByTestId("card-title")).toBeInTheDocument();
    });
  });

  describe("データフォーマット", () => {
    it("ポイントが正しくフォーマットされる", () => {
      const user = { ...mockUser, total_points: 123456 };
      render(
        <CurrentUserCardMission
          currentUser={user}
          mission={mockMission}
          badgeText="5回達成"
        />,
      );

      expect(screen.getByText("123,456pt")).toBeInTheDocument();
    });

    it("大きな数値も正しくフォーマットされる", () => {
      const user = { ...mockUser, total_points: 1000000 };
      render(
        <CurrentUserCardMission
          currentUser={user}
          mission={mockMission}
          badgeText="100回達成"
        />,
      );

      expect(screen.getByText("1,000,000pt")).toBeInTheDocument();
    });
  });

  describe("エッジケース", () => {
    it("空文字列の名前が処理される", () => {
      const user = { ...mockUser, name: "" };
      render(
        <CurrentUserCardMission
          currentUser={user}
          mission={mockMission}
          badgeText="5回達成"
        />,
      );

      expect(screen.getByText("名前未設定")).toBeInTheDocument();
    });

    it("空文字列の都道府県が処理される", () => {
      const user = { ...mockUser, address_prefecture: "" };
      render(
        <CurrentUserCardMission
          currentUser={user}
          mission={mockMission}
          badgeText="5回達成"
        />,
      );

      expect(screen.getByText("未設定")).toBeInTheDocument();
    });

    it("空のバッジテキストが処理される", () => {
      render(
        <CurrentUserCardMission
          currentUser={mockUser}
          mission={mockMission}
          badgeText=""
        />,
      );

      const badge = screen.getByTestId("badge");
      expect(badge).toHaveTextContent("");
    });
  });

  describe("displayUserの変換", () => {
    it("displayUserが正しく変換される", () => {
      const user = { ...mockUser, rank: null };
      render(
        <CurrentUserCardMission
          currentUser={user}
          mission={mockMission}
          badgeText="5回達成"
        />,
      );

      expect(screen.getByText("0")).toBeInTheDocument();
    });
  });
});
