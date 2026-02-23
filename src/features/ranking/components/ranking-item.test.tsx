import { render, screen } from "@testing-library/react";
import type React from "react";
import { RankingItem } from "./ranking-item";

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

const mockPartyMembership = {
  user_id: "test-user-1",
  plan: "starter",
  badge_visibility: true,
  synced_at: "2024-01-01T00:00:00Z",
  metadata: {},
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

type UserRanking = {
  user_id: string;
  name: string;
  address_prefecture: string;
  rank: number | null;
  level: number | null;
  xp: number | null;
  updated_at: string | null;
  party_membership?: typeof mockPartyMembership | null;
};

type UserMissionRanking = {
  user_id: string;
  name: string;
  address_prefecture: string;
  rank: number | null;
  level: number | null;
  xp: number | null;
  updated_at: string | null;
  user_achievement_count: number | null;
  total_points: number | null;
  party_membership?: typeof mockPartyMembership | null;
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
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
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
  updated_at: "2024-01-01T00:00:00Z",
  party_membership: mockPartyMembership,
};

const mockUserMissionRanking: UserMissionRanking = {
  user_id: "test-user-1",
  name: "テストユーザー",
  address_prefecture: "東京都",
  rank: 2,
  level: null,
  xp: null,
  updated_at: null,
  user_achievement_count: null,
  total_points: 2500,
  party_membership: mockPartyMembership,
};

describe("RankingItem", () => {
  beforeEach(() => {
    mockUserNameWithBadge.mockClear();
  });

  describe("基本的な表示", () => {
    it("ユーザー情報が正しく表示される", () => {
      render(<RankingItem user={mockUserRanking} />);

      expect(screen.getByText("テストユーザー")).toBeInTheDocument();
      expect(screen.getByText("東京都 Lv.15")).toBeInTheDocument();
      expect(screen.getByText("1,500pt")).toBeInTheDocument();
      expect(mockUserNameWithBadge).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "テストユーザー",
          membership: mockUserRanking.party_membership,
          badgeSize: 20,
        }),
      );
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

    it("ミッション別ランキングの場合もレベルが表示される", () => {
      render(
        <RankingItem
          user={mockUserRanking}
          userWithMission={mockUserMissionRanking}
          mission={mission}
          badgeText="3回達成"
        />,
      );

      expect(screen.getByText("東京都 Lv.15")).toBeInTheDocument();
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

    it("レベルがnullの場合はLv.が表示される", () => {
      const user = { ...mockUserRanking, level: null };
      render(<RankingItem user={user} />);

      expect(screen.getByText("東京都 Lv.")).toBeInTheDocument();
    });
  });

  describe("ポイント表示のスタイル", () => {
    it("一般ランキングではemeraldバッジでptが表示される", () => {
      render(<RankingItem user={mockUserRanking} />);
      const badge = screen.getByTestId("badge");
      expect(badge).toHaveClass("bg-emerald-100 text-emerald-700");
      expect(screen.getByText("1,500pt")).toBeInTheDocument();
    });

    it("ミッションランキングではgrayバッジで回数が表示される", () => {
      render(
        <RankingItem
          user={mockUserRanking}
          userWithMission={mockUserMissionRanking}
          mission={{ id: "test", name: "test" }}
          badgeText="5回"
        />,
      );
      const badge = screen.getByTestId("badge");
      expect(badge).toHaveClass("bg-gray-100 text-gray-700");
    });
  });
});
