import { render, screen } from "@testing-library/react";
import type React from "react";
import type { UserRanking } from "../types/ranking-types";
import { CurrentUserCardPrefecture } from "./current-user-card-prefecture";

// CardコンポーネントはBaseCurrentUserCardモック内で処理されるため削除

jest.mock("./ranking-level-badge", () => ({
  LevelBadge: ({ level }: { level: number }) => (
    <span data-testid="level-badge">Lv.{level}</span>
  ),
}));

jest.mock("./base-current-user-card", () => ({
  BaseCurrentUserCard: ({
    currentUser,
    level,
    children,
  }: {
    currentUser: any;
    level?: number;
    children: React.ReactNode;
  }) => {
    if (!currentUser) return null;
    return (
      <div className="max-w-6xl mx-auto">
        <div className="border-teal-200 bg-teal-50" data-testid="card">
          <div data-testid="card-header">
            <h2
              className="text-lg flex items-center gap-2"
              data-testid="card-title"
            >
              <div className="w-5 h-5 text-teal-600" data-testid="user-icon" />
              あなたのランク
            </h2>
          </div>
          <div data-testid="card-content">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-teal-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {currentUser.rank || 0}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {currentUser.name || "名前未設定"}
                  </div>
                  <div className="text-sm text-gray-600">
                    {currentUser.address_prefecture || "未設定"}
                    {level != null && <span> Lv.{level}</span>}
                  </div>
                </div>
              </div>
              <div className="text-right">{children}</div>
            </div>
          </div>
        </div>
      </div>
    );
  },
}));

// ranking-utilsとlucide-reactのモックはBaseCurrentUserCardモック内で処理されるため削除

const mockUser: UserRanking = {
  user_id: "test-user-1",
  name: "テストユーザー",
  address_prefecture: "東京都",
  rank: 2,
  level: 30,
  xp: 3000,
  updated_at: "2024-01-01T00:00:00Z",
  party_membership: {
    plan: "regular",
    badge_visibility: true,
    user_id: "test-user-1",
    synced_at: "2024-01-01T00:00:00Z",
    metadata: {},
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
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

    it("レベルが都道府県の横に表示される", () => {
      render(
        <CurrentUserCardPrefecture
          currentUser={mockUser}
          prefecture="東京都"
        />,
      );

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
      const user: UserRanking = { ...mockUser, rank: null };
      render(
        <CurrentUserCardPrefecture currentUser={user} prefecture="東京都" />,
      );

      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("levelがnullの場合は0が表示される", () => {
      const user: UserRanking = { ...mockUser, level: null };
      render(
        <CurrentUserCardPrefecture currentUser={user} prefecture="東京都" />,
      );

      expect(screen.getByText("Lv.0")).toBeInTheDocument();
    });

    it("xpがnullの場合は0ptが表示される", () => {
      const user: UserRanking = { ...mockUser, xp: null };
      render(
        <CurrentUserCardPrefecture currentUser={user} prefecture="東京都" />,
      );

      expect(screen.getByText("0pt")).toBeInTheDocument();
    });
  });

  describe("コンポーネント構造", () => {
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
      const user: UserRanking = { ...mockUser, xp: 123456 };
      render(
        <CurrentUserCardPrefecture currentUser={user} prefecture="東京都" />,
      );

      expect(screen.getByText("12.3万pt")).toBeInTheDocument();
    });

    it("大きな数値も正しくフォーマットされる", () => {
      const user: UserRanking = { ...mockUser, xp: 1000000 };
      render(
        <CurrentUserCardPrefecture currentUser={user} prefecture="東京都" />,
      );

      expect(screen.getByText("100万pt")).toBeInTheDocument();
    });
  });

  describe("エッジケース", () => {
    it("空文字列の名前が処理される", () => {
      const user: UserRanking = { ...mockUser, name: "" };
      render(
        <CurrentUserCardPrefecture currentUser={user} prefecture="東京都" />,
      );

      expect(screen.getByText("名前未設定")).toBeInTheDocument();
    });

    it("空文字列の都道府県が処理される", () => {
      const user: UserRanking = { ...mockUser, address_prefecture: "" };
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
      const user: UserRanking = {
        ...mockUser,
        rank: null,
        level: null,
        xp: null,
      };
      render(
        <CurrentUserCardPrefecture currentUser={user} prefecture="東京都" />,
      );

      expect(screen.getByText("0")).toBeInTheDocument();
      expect(screen.getByText("Lv.0")).toBeInTheDocument();
      expect(screen.getByText("0pt")).toBeInTheDocument();
    });
  });
});
