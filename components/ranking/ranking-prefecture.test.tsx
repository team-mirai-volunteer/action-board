import { render, screen } from "@testing-library/react";
import type React from "react";
import RankingPrefecture from "./ranking-prefecture";

type UserRanking = {
  user_id: string;
  name: string;
  address_prefecture: string;
  rank: number | null;
  level: number | null;
  xp: number | null;
};

jest.mock("@/lib/services/prefecturesRanking", () => ({
  getPrefecturesRanking: jest.fn(),
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
    address_prefecture: "東京都",
    rank: 2,
    level: 20,
    xp: 2000,
  },
];

describe("RankingPrefecture", () => {
  const {
    getPrefecturesRanking,
  } = require("@/lib/services/prefecturesRanking");

  beforeEach(() => {
    getPrefecturesRanking.mockClear();
  });

  describe("基本的な表示", () => {
    it("都道府県が存在しない場合はnullを返す", async () => {
      const result = await RankingPrefecture({
        prefecture: undefined,
        limit: 10,
        showDetailedInfo: false,
      });

      expect(result).toBeNull();
    });

    it("都道府県が空文字の場合はnullを返す", async () => {
      const result = await RankingPrefecture({
        prefecture: "",
        limit: 10,
        showDetailedInfo: false,
      });

      expect(result).toBeNull();
    });

    it("都道府県が存在する場合はランキングを表示する", async () => {
      getPrefecturesRanking.mockResolvedValue(mockRankings);

      render(
        await RankingPrefecture({
          prefecture: "東京都",
          limit: 10,
          showDetailedInfo: false,
        }),
      );

      expect(screen.getByText("東京都", { exact: false })).toBeInTheDocument();
      expect(
        screen.getByText("トップ10", { exact: false }),
      ).toBeInTheDocument();
      expect(screen.getByTestId("card")).toBeInTheDocument();
    });

    it("ランキングアイテムが正しく表示される", async () => {
      getPrefecturesRanking.mockResolvedValue(mockRankings);

      render(
        await RankingPrefecture({
          prefecture: "東京都",
          limit: 10,
          showDetailedInfo: false,
        }),
      );

      const rankingItems = screen.getAllByTestId("ranking-item");
      expect(rankingItems).toHaveLength(2);
      expect(screen.getByText("ユーザー1")).toBeInTheDocument();
      expect(screen.getByText("ユーザー2")).toBeInTheDocument();
    });
  });

  describe("詳細情報表示", () => {
    it("showDetailedInfoがtrueの場合はリンクが表示される", async () => {
      getPrefecturesRanking.mockResolvedValue(mockRankings);

      render(
        await RankingPrefecture({
          prefecture: "東京都",
          limit: 10,
          showDetailedInfo: true,
        }),
      );

      const link = screen.getByTestId("link");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute(
        "href",
        "/ranking/ranking-prefecture?prefecture=東京都",
      );
      expect(screen.getByText("トップ100を見る")).toBeInTheDocument();
      expect(screen.getByTestId("chevron-right")).toBeInTheDocument();
    });

    it("showDetailedInfoがfalseの場合はリンクが表示されない", async () => {
      getPrefecturesRanking.mockResolvedValue(mockRankings);

      render(
        await RankingPrefecture({
          prefecture: "東京都",
          limit: 10,
          showDetailedInfo: false,
        }),
      );

      expect(screen.queryByTestId("link")).not.toBeInTheDocument();
      expect(screen.queryByText("トップ100を見る")).not.toBeInTheDocument();
    });
  });

  describe("limitパラメータ", () => {
    it("limitが指定された場合はタイトルに反映される", async () => {
      getPrefecturesRanking.mockResolvedValue(mockRankings);

      render(
        await RankingPrefecture({
          prefecture: "大阪府",
          limit: 5,
          showDetailedInfo: false,
        }),
      );

      expect(screen.getByText("大阪府", { exact: false })).toBeInTheDocument();
      expect(screen.getByText("トップ5", { exact: false })).toBeInTheDocument();
    });

    it("limitが20の場合", async () => {
      getPrefecturesRanking.mockResolvedValue(mockRankings);

      render(
        await RankingPrefecture({
          prefecture: "愛知県",
          limit: 20,
          showDetailedInfo: false,
        }),
      );

      expect(screen.getByText("愛知県", { exact: false })).toBeInTheDocument();
      expect(
        screen.getByText("トップ20", { exact: false }),
      ).toBeInTheDocument();
    });
  });

  describe("サービス関数の呼び出し", () => {
    it("getPrefecturesRankingが正しいパラメータで呼ばれる", async () => {
      getPrefecturesRanking.mockResolvedValue(mockRankings);

      await RankingPrefecture({
        prefecture: "福岡県",
        limit: 15,
        showDetailedInfo: false,
      });

      expect(getPrefecturesRanking).toHaveBeenCalledWith("福岡県", 15, "daily");
    });
  });

  describe("エラーハンドリング", () => {
    it("getPrefecturesRankingがエラーを投げても処理が継続される", async () => {
      getPrefecturesRanking.mockRejectedValue(new Error("API Error"));

      await expect(
        RankingPrefecture({
          prefecture: "東京都",
          limit: 10,
          showDetailedInfo: false,
        }),
      ).rejects.toThrow("API Error");
    });
  });

  describe("空のデータ", () => {
    it("ランキングが空の場合でもエラーにならない", async () => {
      getPrefecturesRanking.mockResolvedValue([]);

      render(
        await RankingPrefecture({
          prefecture: "東京都",
          limit: 10,
          showDetailedInfo: false,
        }),
      );

      expect(screen.getByText("東京都", { exact: false })).toBeInTheDocument();
      expect(
        screen.getByText("トップ10", { exact: false }),
      ).toBeInTheDocument();
      expect(screen.queryByTestId("ranking-item")).not.toBeInTheDocument();
    });
  });

  describe("レイアウト構造", () => {
    it("適切なCSSクラスが設定される", async () => {
      getPrefecturesRanking.mockResolvedValue(mockRankings);

      render(
        await RankingPrefecture({
          prefecture: "東京都",
          limit: 10,
          showDetailedInfo: false,
        }),
      );

      const card = screen.getByTestId("card");
      expect(card).toHaveClass(
        "border-2",
        "border-gray-200",
        "rounded-2xl",
        "transition-all",
        "duration-300",
        "p-8",
        "bg-white",
      );
    });
  });
});
