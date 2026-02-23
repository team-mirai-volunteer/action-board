import { render, screen } from "@testing-library/react";
import type React from "react";
import { CurrentUserCard } from "./current-user-card";

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

jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

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

jest.mock("@/features/ranking/components/ranking-level-badge", () => ({
  LevelBadge: ({ level }: { level: number }) => (
    <span data-testid="level-badge">Lv.{level}</span>
  ),
}));

jest.mock("@/features/user-profile/components/user-avatar", () => {
  return ({ userId }: { userId: string }) => (
    <div data-testid="user-avatar">{userId}</div>
  );
});

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
  rank: 5,
  level: 25,
  xp: 2500,
  updated_at: "2024-01-01T00:00:00Z",
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

describe("CurrentUserCard", () => {
  beforeEach(() => {
    mockUserNameWithBadge.mockClear();
  });

  describe("基本的な表示", () => {
    it("ユーザー情報が正しく表示される", () => {
      render(<CurrentUserCard currentUser={mockUser} />);

      expect(screen.getByText("テストユーザー")).toBeInTheDocument();
      expect(screen.getByText("東京都")).toBeInTheDocument();
      expect(screen.getByText("2,500pt")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(mockUserNameWithBadge).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "テストユーザー",
          membership: mockUser.party_membership,
        }),
      );
    });

    it("タイトルが正しく表示される", () => {
      render(<CurrentUserCard currentUser={mockUser} />);

      expect(screen.getByText("あなたのランク")).toBeInTheDocument();
      expect(screen.getByTestId("user-icon")).toBeInTheDocument();
    });

    it("レベルが都道府県の横に表示される", () => {
      render(<CurrentUserCard currentUser={mockUser} />);

      expect(screen.getByText("Lv.25")).toBeInTheDocument();
    });
  });

  describe("null値の処理", () => {
    it("currentUserがnullの場合は何も表示されない", () => {
      const { container } = render(<CurrentUserCard currentUser={null} />);

      expect(container.firstChild).toBeNull();
    });

    it("rankがnullの場合は0が表示される", () => {
      const user = { ...mockUser, rank: null };
      render(<CurrentUserCard currentUser={user} />);

      const rankElement = screen.getByText("0");
      expect(rankElement).toBeInTheDocument();
    });

    it("levelがnullの場合は0が表示される", () => {
      const user = { ...mockUser, level: null };
      render(<CurrentUserCard currentUser={user} />);

      expect(screen.getByText("Lv.0")).toBeInTheDocument();
    });

    it("xpがnullの場合は0ptが表示される", () => {
      const user = { ...mockUser, xp: null };
      render(<CurrentUserCard currentUser={user} />);

      expect(screen.getByText("0pt")).toBeInTheDocument();
    });
  });

  describe("コンポーネント構造", () => {
    it("カードの構造が正しい", () => {
      render(<CurrentUserCard currentUser={mockUser} />);

      expect(screen.getByTestId("card-header")).toBeInTheDocument();
      expect(screen.getByTestId("card-content")).toBeInTheDocument();
      expect(screen.getByTestId("card-title")).toBeInTheDocument();
    });
  });

  describe("データフォーマット", () => {
    it("XPが正しくフォーマットされる", () => {
      const user = { ...mockUser, xp: 123456 };
      render(<CurrentUserCard currentUser={user} />);

      expect(screen.getByText("12.3万pt")).toBeInTheDocument();
    });

    it("大きな数値も正しくフォーマットされる", () => {
      const user = { ...mockUser, xp: 1000000 };
      render(<CurrentUserCard currentUser={user} />);

      expect(screen.getByText("100万pt")).toBeInTheDocument();
    });
  });

  describe("エッジケース", () => {
    it("空文字列の名前が処理される", () => {
      const user = { ...mockUser, name: "" };
      render(<CurrentUserCard currentUser={user} />);

      expect(screen.getByText("名前未設定")).toBeInTheDocument();
    });

    it("空文字列の都道府県が処理される", () => {
      const user = { ...mockUser, address_prefecture: "" };
      render(<CurrentUserCard currentUser={user} />);

      expect(screen.getByText("未設定")).toBeInTheDocument();
    });

    it("負の値のランクが処理される", () => {
      const user = { ...mockUser, rank: -1 };
      render(<CurrentUserCard currentUser={user} />);

      expect(screen.getByText("-1")).toBeInTheDocument();
    });
  });
});
