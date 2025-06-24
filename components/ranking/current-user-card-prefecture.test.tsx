import { render, screen } from "@testing-library/react";
import type React from "react";
import { CurrentUserCardPrefecture } from "./current-user-card-prefecture";

type UserRanking = {
  user_id: string;
  name: string;
  address_prefecture: string;
  rank: number | null;
  level: number | null;
  xp: number | null;
};

jest.mock("@/components/ui/card", () => ({
  Card: ({
    children,
    className,
  }: { children: React.ReactNode; className?: string }) => (
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
  }: { children: React.ReactNode; className?: string }) => (
    <h2 className={className} data-testid="card-title">
      {children}
    </h2>
  ),
}));

jest.mock("./ranking-level-badge", () => ({
  LevelBadge: ({ level }: { level: number }) => (
    <span data-testid="level-badge">Lv.{level}</span>
  ),
}));

jest.mock("@/lib/utils/ranking-utils", () => ({
  formatUserDisplayName: (name: string) => name || "名前未設定",
  formatUserPrefecture: (prefecture: string) => prefecture || "未設定",
}));

jest.mock("lucide-react", () => ({
  User: ({ className }: { className?: string }) => (
    <div className={className} data-testid="user-icon" />
  ),
}));

const mockUser: UserRanking = {
  user_id: "test-user-1",
  name: "テストユーザー",
  address_prefecture: "東京都",
  rank: 2,
  level: 30,
  xp: 3000,
};

describe("CurrentUserCardPrefecture", () => {
  describe("基本的な表示", () => {
    it("ユーザー情報が正しく表示される", () => {
      render(
        <CurrentUserCardPrefecture
          currentUser={mockUser}
          prefecture="東京都"
        />,
      );

      expect(screen.getByText("テストユーザー")).toBeInTheDocument();
      expect(screen.getByText("東京都")).toBeInTheDocument();
      expect(screen.getByText("3,000pt")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("タイトルが正しく表示される", () => {
      render(
        <CurrentUserCardPrefecture
          currentUser={mockUser}
          prefecture="東京都"
        />,
      );

      expect(screen.getByText("あなたのランク")).toBeInTheDocument();
      expect(screen.getByTestId("user-icon")).toBeInTheDocument();
    });

    it("レベルバッジが表示される", () => {
      render(
        <CurrentUserCardPrefecture
          currentUser={mockUser}
          prefecture="東京都"
        />,
      );

      expect(screen.getByTestId("level-badge")).toBeInTheDocument();
      expect(screen.getByText("Lv.30")).toBeInTheDocument();
    });
  });

  describe("null値の処理", () => {
    it("currentUserがnullの場合は何も表示されない", () => {
      const { container } = render(
        <CurrentUserCardPrefecture currentUser={null} prefecture="東京都" />,
      );

      expect(container.firstChild).toBeNull();
    });

    it("rankがnullの場合は0が表示される", () => {
      const user = { ...mockUser, rank: null };
      render(
        <CurrentUserCardPrefecture currentUser={user} prefecture="東京都" />,
      );

      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("levelがnullの場合は0が表示される", () => {
      const user = { ...mockUser, level: null };
      render(
        <CurrentUserCardPrefecture currentUser={user} prefecture="東京都" />,
      );

      expect(screen.getByText("Lv.0")).toBeInTheDocument();
    });

    it("xpがnullの場合は0ptが表示される", () => {
      const user = { ...mockUser, xp: null };
      render(
        <CurrentUserCardPrefecture currentUser={user} prefecture="東京都" />,
      );

      expect(screen.getByText("0pt")).toBeInTheDocument();
    });
  });

  describe("レイアウト構造", () => {
    it("適切なCSSクラスが設定される", () => {
      render(
        <CurrentUserCardPrefecture
          currentUser={mockUser}
          prefecture="東京都"
        />,
      );

      const card = screen.getByTestId("card");
      expect(card).toHaveClass("border-teal-200", "bg-teal-50");
    });

    it("カードの構造が正しい", () => {
      render(
        <CurrentUserCardPrefecture
          currentUser={mockUser}
          prefecture="東京都"
        />,
      );

      expect(screen.getByTestId("card-header")).toBeInTheDocument();
      expect(screen.getByTestId("card-content")).toBeInTheDocument();
      expect(screen.getByTestId("card-title")).toBeInTheDocument();
    });
  });

  describe("データフォーマット", () => {
    it("XPが正しくフォーマットされる", () => {
      const user = { ...mockUser, xp: 123456 };
      render(
        <CurrentUserCardPrefecture currentUser={user} prefecture="東京都" />,
      );

      expect(screen.getByText("123,456pt")).toBeInTheDocument();
    });

    it("大きな数値も正しくフォーマットされる", () => {
      const user = { ...mockUser, xp: 1000000 };
      render(
        <CurrentUserCardPrefecture currentUser={user} prefecture="東京都" />,
      );

      expect(screen.getByText("1,000,000pt")).toBeInTheDocument();
    });
  });

  describe("エッジケース", () => {
    it("空文字列の名前が処理される", () => {
      const user = { ...mockUser, name: "" };
      render(
        <CurrentUserCardPrefecture currentUser={user} prefecture="東京都" />,
      );

      expect(screen.getByText("名前未設定")).toBeInTheDocument();
    });

    it("空文字列の都道府県が処理される", () => {
      const user = { ...mockUser, address_prefecture: "" };
      render(
        <CurrentUserCardPrefecture currentUser={user} prefecture="東京都" />,
      );

      expect(screen.getByText("未設定")).toBeInTheDocument();
    });

    it("異なる都道府県が指定された場合", () => {
      render(
        <CurrentUserCardPrefecture
          currentUser={mockUser}
          prefecture="大阪府"
        />,
      );

      expect(screen.getByText("東京都")).toBeInTheDocument();
    });
  });

  describe("displayUserの変換", () => {
    it("displayUserが正しく変換される", () => {
      const user = { ...mockUser, rank: null, level: null, xp: null };
      render(
        <CurrentUserCardPrefecture currentUser={user} prefecture="東京都" />,
      );

      expect(screen.getByText("0")).toBeInTheDocument();
      expect(screen.getByText("Lv.0")).toBeInTheDocument();
      expect(screen.getByText("0pt")).toBeInTheDocument();
    });
  });
});
