import { render, screen } from "@testing-library/react";
import type React from "react";
import RankingTop from "./ranking-top";

type UserRanking = {
  user_id: string;
  name: string;
  address_prefecture: string;
  rank: number | null;
  level: number | null;
  xp: number | null;
};

jest.mock("@/lib/services/ranking", () => ({
  getRanking: jest.fn(),
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({
    children,
    className,
  }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
}));

jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="link">
      {children}
    </a>
  );
});

jest.mock("lucide-react", () => ({
  ChevronRight: ({ className }: { className?: string }) => (
    <div className={className} data-testid="chevron-right" />
  ),
}));

jest.mock("./ranking-item", () => ({
  RankingItem: ({ user }: any) => (
    <div data-testid="ranking-item">
      <span data-testid="user-name">{user.name}</span>
    </div>
  ),
}));

const mockRankings: UserRanking[] = [
  {
    user_id: "user-1",
    name: "ユーザー1",
    address_prefecture: "東京都",
    rank: 1,
    level: 25,
    xp: 2500,
  },
  {
    user_id: "user-2",
    name: "ユーザー2",
    address_prefecture: "大阪府",
    rank: 2,
    level: 20,
    xp: 2000,
  },
];

describe("RankingTop", () => {
  const { getRanking } = require("@/lib/services/ranking");

  beforeEach(() => {
    getRanking.mockClear();
  });

  describe("基本的な表示", () => {
    it("デフォルトのlimit値でランキングを表示する", async () => {
      getRanking.mockResolvedValue(mockRankings);

      render(await RankingTop({}));

      expect(
        screen.getByText("🏅アクションリーダートップ10"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("card")).toBeInTheDocument();
    });

    it("指定されたlimit値でタイトルが表示される", async () => {
      getRanking.mockResolvedValue(mockRankings);

      render(await RankingTop({ limit: 5 }));

      expect(
        screen.getByText("🏅アクションリーダートップ5"),
      ).toBeInTheDocument();
    });

    it("ランキングアイテムが正しく表示される", async () => {
      getRanking.mockResolvedValue(mockRankings);

      render(await RankingTop({}));

      const rankingItems = screen.getAllByTestId("ranking-item");
      expect(rankingItems).toHaveLength(2);
      expect(screen.getByText("ユーザー1")).toBeInTheDocument();
      expect(screen.getByText("ユーザー2")).toBeInTheDocument();
    });
  });

  describe("詳細情報表示", () => {
    it("showDetailedInfoがtrueの場合はリンクが表示される", async () => {
      getRanking.mockResolvedValue(mockRankings);

      render(await RankingTop({ showDetailedInfo: true }));

      const link = screen.getByTestId("link");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/ranking");
      expect(screen.getByText("トップ100を見る")).toBeInTheDocument();
      expect(screen.getByTestId("chevron-right")).toBeInTheDocument();
    });

    it("showDetailedInfoがfalseの場合はリンクが表示されない", async () => {
      getRanking.mockResolvedValue(mockRankings);

      render(await RankingTop({ showDetailedInfo: false }));

      expect(screen.queryByTestId("link")).not.toBeInTheDocument();
      expect(screen.queryByText("トップ100を見る")).not.toBeInTheDocument();
    });

    it("showDetailedInfoのデフォルト値はfalseである", async () => {
      getRanking.mockResolvedValue(mockRankings);

      render(await RankingTop({}));

      expect(screen.queryByTestId("link")).not.toBeInTheDocument();
    });
  });

  describe("limitパラメータ", () => {
    it("limitが指定された場合はタイトルに反映される", async () => {
      getRanking.mockResolvedValue(mockRankings);

      render(await RankingTop({ limit: 20 }));

      expect(
        screen.getByText("🏅アクションリーダートップ20"),
      ).toBeInTheDocument();
    });

    it("limitが1の場合", async () => {
      getRanking.mockResolvedValue(mockRankings);

      render(await RankingTop({ limit: 1 }));

      expect(
        screen.getByText("🏅アクションリーダートップ1"),
      ).toBeInTheDocument();
    });
  });

  describe("サービス関数の呼び出し", () => {
    it("getRankingが正しいパラメータで呼ばれる", async () => {
      getRanking.mockResolvedValue(mockRankings);

      await RankingTop({ limit: 15 });

      expect(getRanking).toHaveBeenCalledWith(15);
    });

    it("デフォルトのlimit値で呼ばれる", async () => {
      getRanking.mockResolvedValue(mockRankings);

      await RankingTop({});

      expect(getRanking).toHaveBeenCalledWith(10);
    });
  });

  describe("エラーハンドリング", () => {
    it("getRankingがエラーを投げても処理が継続される", async () => {
      getRanking.mockRejectedValue(new Error("API Error"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      render(await RankingTop({}));

      expect(
        screen.getByText("🏅アクションリーダートップ10"),
      ).toBeInTheDocument();
      expect(screen.queryByTestId("ranking-item")).not.toBeInTheDocument();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Ranking component error:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });

  describe("空のデータ", () => {
    it("ランキングが空の場合でもエラーにならない", async () => {
      getRanking.mockResolvedValue([]);

      render(await RankingTop({}));

      expect(
        screen.getByText("🏅アクションリーダートップ10"),
      ).toBeInTheDocument();
      expect(screen.queryByTestId("ranking-item")).not.toBeInTheDocument();
    });
  });

  describe("レイアウト構造", () => {
    it("適切なCSSクラスが設定される", async () => {
      getRanking.mockResolvedValue(mockRankings);

      render(await RankingTop({}));

      const card = screen.getByTestId("card");
      expect(card).toHaveClass(
        "border-2",
        "border-gray-200",
        "rounded-2xl",
        "shadow-lg",
        "hover:shadow-xl",
        "transition-all",
        "duration-300",
        "p-8",
        "bg-white",
      );
    });
  });

  describe("プロップスの組み合わせ", () => {
    it("limitとshowDetailedInfoが両方指定された場合", async () => {
      getRanking.mockResolvedValue(mockRankings);

      render(await RankingTop({ limit: 25, showDetailedInfo: true }));

      expect(
        screen.getByText("🏅アクションリーダートップ25"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("link")).toBeInTheDocument();
    });
  });
});
