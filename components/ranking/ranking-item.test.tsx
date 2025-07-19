import { render, screen } from "@testing-library/react";
import type React from "react";
import { RankingItem } from "./ranking-item";

type UserRanking = {
  user_id: string;
  name: string;
  address_prefecture: string;
  rank: number | null;
  level: number | null;
  xp: number | null;
};

type UserMissionRanking = {
  user_id: string;
  name: string;
  address_prefecture: string;
  rank: number | null;
  total_points: number | null;
};

jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

jest.mock("@/components/ui/badge", () => ({
  Badge: ({
    children,
    className,
  }: { children: React.ReactNode; className?: string }) => (
    <span className={className} data-testid="badge">
      {children}
    </span>
  ),
}));

jest.mock("lucide-react", () => ({
  Crown: ({ className }: { className?: string }) => (
    <div className={className} data-testid="crown-icon" />
  ),
  Trophy: ({ className }: { className?: string }) => (
    <div className={className} data-testid="trophy-icon" />
  ),
  Medal: ({ className }: { className?: string }) => (
    <div className={className} data-testid="medal-icon" />
  ),
}));

const mockUserRanking: UserRanking = {
  user_id: "test-user-1",
  name: "テストユーザー",
  address_prefecture: "東京都",
  rank: 1,
  level: 15,
  xp: 1500,
};

const mockUserMissionRanking: UserMissionRanking = {
  user_id: "test-user-1",
  name: "テストユーザー",
  address_prefecture: "東京都",
  rank: 2,
  total_points: 2500,
};

describe("RankingItem", () => {
  describe("基本的な表示", () => {
    it("ユーザー情報が正しく表示される", () => {
      render(<RankingItem user={mockUserRanking} />);

      expect(screen.getByText("テストユーザー")).toBeInTheDocument();
      expect(screen.getByText("東京都")).toBeInTheDocument();
      expect(screen.getByText("1,500pt")).toBeInTheDocument();
      expect(screen.getByText("Lv.15")).toBeInTheDocument();
    });

    it("リンクが正しく設定される", () => {
      render(<RankingItem user={mockUserRanking} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/users/test-user-1");
    });
  });

  describe("ランクアイコンの表示", () => {
    it("1位の場合はクラウンアイコンが表示される", () => {
      const user = { ...mockUserRanking, rank: 1 };
      render(<RankingItem user={user} />);

      expect(screen.getByTestId("crown-icon")).toBeInTheDocument();
    });

    it("2位の場合はトロフィーアイコンが表示される", () => {
      const user = { ...mockUserRanking, rank: 2 };
      render(<RankingItem user={user} />);

      expect(screen.getByTestId("trophy-icon")).toBeInTheDocument();
    });

    it("3位の場合はメダルアイコンが表示される", () => {
      const user = { ...mockUserRanking, rank: 3 };
      render(<RankingItem user={user} />);

      expect(screen.getByTestId("medal-icon")).toBeInTheDocument();
    });

    it("4位以下の場合は数字が表示される", () => {
      const user = { ...mockUserRanking, rank: 4 };
      render(<RankingItem user={user} />);

      expect(screen.getByText("4")).toBeInTheDocument();
    });

    it("ランクがnullの場合は0が表示される", () => {
      const user = { ...mockUserRanking, rank: null };
      render(<RankingItem user={user} />);

      expect(screen.getByText("0")).toBeInTheDocument();
    });
  });

  describe("ミッション別ランキング表示", () => {
    const mission = {
      id: "test-mission",
      name: "テストミッション",
    };

    it("ミッション別ランキングの場合はポイントが表示される", () => {
      render(
        <RankingItem
          user={mockUserRanking}
          userWithMission={mockUserMissionRanking}
          mission={mission}
          badgeText="5回達成"
        />,
      );

      expect(screen.getByText("2,500pt")).toBeInTheDocument();
      expect(screen.getByText("5回達成")).toBeInTheDocument();
    });

    it("ミッション別ランキングの場合はレベル表示されない", () => {
      render(
        <RankingItem
          user={mockUserRanking}
          userWithMission={mockUserMissionRanking}
          mission={mission}
          badgeText="3回達成"
        />,
      );

      expect(screen.queryByText("Lv.15")).not.toBeInTheDocument();
    });

    it("userWithMissionがnullの場合は0ptが表示される", () => {
      render(
        <RankingItem
          user={mockUserRanking}
          userWithMission={undefined}
          mission={mission}
          badgeText="0回達成"
        />,
      );

      expect(screen.getByText("0pt")).toBeInTheDocument();
    });
  });

  describe("詳細情報表示", () => {
    it("showDetailedInfoがtrueの場合はユーザーIDが表示される", () => {
      render(<RankingItem user={mockUserRanking} showDetailedInfo={true} />);

      expect(screen.getByText("ID: test-user-1")).toBeInTheDocument();
    });

    it("showDetailedInfoがfalseの場合はユーザーIDが表示されない", () => {
      render(<RankingItem user={mockUserRanking} showDetailedInfo={false} />);

      expect(screen.queryByText("ID: test-user-1")).not.toBeInTheDocument();
    });

    it("showDetailedInfoが未指定の場合はユーザーIDが表示されない", () => {
      render(<RankingItem user={mockUserRanking} />);

      expect(screen.queryByText("ID: test-user-1")).not.toBeInTheDocument();
    });
  });

  describe("null値の処理", () => {
    it("XPがnullの場合は0ptが表示される", () => {
      const user = { ...mockUserRanking, xp: null };
      render(<RankingItem user={user} />);

      expect(screen.getByText("0pt")).toBeInTheDocument();
    });

    it("レベルがnullの場合はLv.nullが表示される", () => {
      const user = { ...mockUserRanking, level: null };
      render(<RankingItem user={user} />);

      expect(screen.getByText("Lv.")).toBeInTheDocument();
    });
  });
});
