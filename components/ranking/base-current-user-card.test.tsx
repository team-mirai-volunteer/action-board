import { render, screen } from "@testing-library/react";
import type React from "react";
import BaseCurrentUserCard from "./base-current-user-card";

jest.mock("@/components/ui/card", () => ({
  Card: ({
    children,
    className,
  }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({
    children,
    className,
  }: { children: React.ReactNode; className?: string }) => (
    <h3 className={className} data-testid="card-title">
      {children}
    </h3>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
}));

jest.mock("lucide-react", () => ({
  User: ({ className }: { className?: string }) => (
    <div className={className} data-testid="user-icon" />
  ),
}));

jest.mock("@/lib/utils/ranking-utils", () => ({
  formatUserDisplayName: (name: string | null) => name || "名無しユーザー",
  formatUserPrefecture: (prefecture: string | null) => prefecture || "未設定",
}));

describe("BaseCurrentUserCard", () => {
  const mockCurrentUser = {
    user_id: "test-user-1",
    name: "テストユーザー",
    address_prefecture: "東京都",
    rank: 5,
  };

  describe("基本的な表示", () => {
    it("ユーザー情報が正しく表示される", () => {
      render(
        <BaseCurrentUserCard currentUser={mockCurrentUser}>
          <div data-testid="points">1000pt</div>
        </BaseCurrentUserCard>,
      );

      expect(screen.getByText("あなたのランク")).toBeInTheDocument();
      expect(screen.getByText("テストユーザー")).toBeInTheDocument();
      expect(screen.getByText("東京都")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("currentUserがnullの場合は何も表示されない", () => {
      const { container } = render(
        <BaseCurrentUserCard currentUser={null}>
          <div>テストコンテンツ</div>
        </BaseCurrentUserCard>,
      );

      expect(container.firstChild).toBeNull();
    });

    it("子要素が正しくレンダリングされる", () => {
      render(
        <BaseCurrentUserCard currentUser={mockCurrentUser}>
          <div data-testid="custom-content">カスタムコンテンツ</div>
        </BaseCurrentUserCard>,
      );

      expect(screen.getByTestId("custom-content")).toBeInTheDocument();
      expect(screen.getByText("カスタムコンテンツ")).toBeInTheDocument();
    });
  });

  describe("カスタムタイトル", () => {
    it("カスタムタイトルが設定できる", () => {
      render(
        <BaseCurrentUserCard
          currentUser={mockCurrentUser}
          title="カスタムランキング"
        >
          <div>コンテンツ</div>
        </BaseCurrentUserCard>,
      );

      expect(screen.getByText("カスタムランキング")).toBeInTheDocument();
    });

    it("デフォルトタイトルは「あなたのランク」", () => {
      render(
        <BaseCurrentUserCard currentUser={mockCurrentUser}>
          <div>コンテンツ</div>
        </BaseCurrentUserCard>,
      );

      expect(screen.getByText("あなたのランク")).toBeInTheDocument();
    });
  });

  describe("ランク表示", () => {
    it("ランクが正しく表示される", () => {
      render(
        <BaseCurrentUserCard currentUser={mockCurrentUser}>
          <div>コンテンツ</div>
        </BaseCurrentUserCard>,
      );

      const rankElement = screen.getByText("5");
      // ランクが表示されていることを確認
      expect(rankElement).toBeInTheDocument();
    });

    it("ランクが0の場合でも正しく表示される", () => {
      const userWithZeroRank = { ...mockCurrentUser, rank: 0 };
      render(
        <BaseCurrentUserCard currentUser={userWithZeroRank}>
          <div>コンテンツ</div>
        </BaseCurrentUserCard>,
      );

      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("ランクがnullの場合は0として表示される", () => {
      const userWithNullRank = { ...mockCurrentUser, rank: null };
      render(
        <BaseCurrentUserCard currentUser={userWithNullRank as any}>
          <div>コンテンツ</div>
        </BaseCurrentUserCard>,
      );

      expect(screen.getByText("0")).toBeInTheDocument();
    });
  });

  describe("レイアウト構造", () => {
    it("カードのスタイルが正しく適用される", () => {
      render(
        <BaseCurrentUserCard currentUser={mockCurrentUser}>
          <div>コンテンツ</div>
        </BaseCurrentUserCard>,
      );

      const card = screen.getByTestId("card");
      expect(card).toHaveClass("border-teal-200", "bg-teal-50");
    });

    it("内部コンテナのスタイルが正しく適用される", () => {
      const { container } = render(
        <BaseCurrentUserCard currentUser={mockCurrentUser}>
          <div>コンテンツ</div>
        </BaseCurrentUserCard>,
      );

      const wrapper = container.querySelector(".max-w-6xl");
      expect(wrapper).toHaveClass("max-w-6xl", "mx-auto");
    });

    it("ユーザー情報エリアのスタイルが正しい", () => {
      const { container } = render(
        <BaseCurrentUserCard currentUser={mockCurrentUser}>
          <div>コンテンツ</div>
        </BaseCurrentUserCard>,
      );

      const userInfoContainer = container.querySelector(
        ".bg-white.rounded-lg.border",
      );
      expect(userInfoContainer).toHaveClass(
        "bg-white",
        "rounded-lg",
        "border",
        "border-teal-200",
      );
    });

    it("アイコンが正しく表示される", () => {
      render(
        <BaseCurrentUserCard currentUser={mockCurrentUser}>
          <div>コンテンツ</div>
        </BaseCurrentUserCard>,
      );

      expect(screen.getByTestId("user-icon")).toHaveClass(
        "w-5",
        "h-5",
        "text-teal-600",
      );
    });
  });

  describe("フォーマット関数の適用", () => {
    it("名前がフォーマットされる", () => {
      const userWithNullName = { ...mockCurrentUser, name: null };
      render(
        <BaseCurrentUserCard currentUser={userWithNullName as any}>
          <div>コンテンツ</div>
        </BaseCurrentUserCard>,
      );

      expect(screen.getByText("名無しユーザー")).toBeInTheDocument();
    });

    it("都道府県がフォーマットされる", () => {
      const userWithNullPrefecture = {
        ...mockCurrentUser,
        address_prefecture: null,
      };
      render(
        <BaseCurrentUserCard currentUser={userWithNullPrefecture as any}>
          <div>コンテンツ</div>
        </BaseCurrentUserCard>,
      );

      expect(screen.getByText("未設定")).toBeInTheDocument();
    });
  });

  describe("複数の子要素", () => {
    it("複数の子要素が正しくレンダリングされる", () => {
      render(
        <BaseCurrentUserCard currentUser={mockCurrentUser}>
          <div data-testid="child-1">子要素1</div>
          <div data-testid="child-2">子要素2</div>
          <span data-testid="child-3">子要素3</span>
        </BaseCurrentUserCard>,
      );

      expect(screen.getByTestId("child-1")).toBeInTheDocument();
      expect(screen.getByTestId("child-2")).toBeInTheDocument();
      expect(screen.getByTestId("child-3")).toBeInTheDocument();
    });
  });

  describe("エッジケース", () => {
    it("空の子要素でもエラーにならない", () => {
      render(
        <BaseCurrentUserCard currentUser={mockCurrentUser}>
          {null}
        </BaseCurrentUserCard>,
      );

      expect(screen.getByText("テストユーザー")).toBeInTheDocument();
    });

    it("すべてのユーザー情報が最小値の場合", () => {
      const minimalUser = {
        user_id: "",
        name: "",
        address_prefecture: "",
        rank: 0,
      };
      render(
        <BaseCurrentUserCard currentUser={minimalUser}>
          <div>コンテンツ</div>
        </BaseCurrentUserCard>,
      );

      expect(screen.getByText("0")).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("カードタイトルが適切な構造を持つ", () => {
      render(
        <BaseCurrentUserCard currentUser={mockCurrentUser}>
          <div>コンテンツ</div>
        </BaseCurrentUserCard>,
      );

      const title = screen.getByTestId("card-title");
      expect(title).toContainElement(screen.getByTestId("user-icon"));
      expect(title).toHaveTextContent("あなたのランク");
    });

    it("ユーザー情報が適切にグループ化されている", () => {
      const { container } = render(
        <BaseCurrentUserCard currentUser={mockCurrentUser}>
          <div>コンテンツ</div>
        </BaseCurrentUserCard>,
      );

      const userInfoGroup = container.querySelector(".flex.items-center.gap-3");
      expect(userInfoGroup).toContainElement(screen.getByText("5"));
      expect(userInfoGroup).toContainElement(
        screen.getByText("テストユーザー"),
      );
      expect(userInfoGroup).toContainElement(screen.getByText("東京都"));
    });
  });
});
