import Mission from "@/components/features/mission/components/Mission";
import type { Tables } from "@/lib/types/supabase";
import { render, screen } from "@testing-library/react";
import type React from "react";

jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

jest.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="avatar">{children}</div>
  ),
  AvatarFallback: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="avatar-fallback">{children}</div>
  ),
  AvatarImage: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="avatar-image" />
  ),
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
  CardContent: ({
    children,
    className,
  }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="card-content">
      {children}
    </div>
  ),
  CardFooter: ({
    children,
    className,
  }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="card-footer">
      {children}
    </div>
  ),
  CardHeader: ({
    children,
    className,
  }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="card-header">
      {children}
    </div>
  ),
  CardTitle: ({
    children,
    className,
  }: { children: React.ReactNode; className?: string }) => (
    <h3 className={className} data-testid="card-title">
      {children}
    </h3>
  ),
}));

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

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    className,
    variant,
    disabled,
  }: {
    children: React.ReactNode;
    className?: string;
    variant?: string;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      className={className}
      disabled={disabled}
      data-testid="button"
    >
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/mission-icon", () => ({
  MissionIcon: ({
    src,
    alt,
    size,
  }: { src: string; alt: string; size: string }) => (
    <img src={src} alt={alt} data-testid="mission-icon" />
  ),
}));

jest.mock(
  "@/components/features/mission/components/MissionAchievementStatus",
  () => {
    return {
      MissionAchievementStatus: function MockMissionAchievementStatus({
        mission,
        userAchievementCount,
      }: {
        mission: { max_achievement_count: number | null };
        userAchievementCount: number;
      }) {
        const maxAchievements = mission.max_achievement_count;
        const isCompleted =
          maxAchievements !== null && userAchievementCount >= maxAchievements;

        if (isCompleted) {
          return <div data-testid="achievement-status">完了済み</div>;
        }
        if (userAchievementCount > 0) {
          return (
            <div data-testid="achievement-status">
              進行中 ({userAchievementCount}
              {maxAchievements ? `/${maxAchievements}` : ""})
            </div>
          );
        }
        return <div data-testid="achievement-status">未達成</div>;
      },
    };
  },
);

jest.mock("lucide-react", () => ({
  Calendar: ({ className }: { className?: string }) => (
    <div className={className} data-testid="calendar-icon" />
  ),
  Star: ({ className }: { className?: string }) => (
    <div className={className} data-testid="star-icon" />
  ),
  Users: ({ className }: { className?: string }) => (
    <div className={className} data-testid="users-icon" />
  ),
  CheckCircle: ({ className }: { className?: string }) => (
    <div className={className} data-testid="check-circle-icon" />
  ),
  Clock: ({ className }: { className?: string }) => (
    <div className={className} data-testid="clock-icon" />
  ),
}));

const mockMission: Tables<"missions"> = {
  id: "test-mission-1",
  slug: "test-mission-1",
  title: "テストミッション",
  content: "テストミッションの内容",
  difficulty: 1,
  icon_url: "/test-icon.svg",
  event_date: "2025-06-22",
  max_achievement_count: 3,
  is_featured: false,
  is_hidden: false,
  featured_importance: null,
  required_artifact_type: "NONE",
  artifact_label: null,
  ogp_image_url: null,
  created_at: "2025-06-22T00:00:00Z",
  updated_at: "2025-06-22T00:00:00Z",
};

describe("Mission", () => {
  it("ミッション情報が正しく表示される", () => {
    render(
      <Mission
        mission={mockMission}
        userAchievementCount={0}
        totalAchievementCount={10}
      />,
    );

    expect(screen.getByText("テストミッション")).toBeInTheDocument();
    expect(screen.getByText("みんなで10回達成")).toBeInTheDocument();
    expect(screen.getByText("今すぐチャレンジ🔥")).toBeInTheDocument();
  });

  it("イベント日付が正しく表示される", () => {
    render(
      <Mission
        mission={mockMission}
        userAchievementCount={0}
        totalAchievementCount={5}
      />,
    );

    expect(screen.getByText("6月22日（日）開催")).toBeInTheDocument();
  });

  it("最大達成回数に達した場合の表示が正しい", () => {
    render(
      <Mission
        mission={mockMission}
        userAchievementCount={3}
        totalAchievementCount={15}
      />,
    );

    expect(screen.getByText("ミッションクリア🎉")).toBeInTheDocument();
  });

  it("最大達成回数が設定されていない場合は制限なし", () => {
    const missionWithoutLimit = { ...mockMission, max_achievement_count: null };

    render(
      <Mission
        mission={missionWithoutLimit}
        userAchievementCount={5}
        totalAchievementCount={20}
      />,
    );

    expect(screen.getByText("もう一回チャレンジ🔥")).toBeInTheDocument();
  });

  it("アイコンURLがnullの場合はフォールバック画像を使用", () => {
    const missionWithoutIcon = { ...mockMission, icon_url: null };

    render(
      <Mission
        mission={missionWithoutIcon}
        userAchievementCount={0}
        totalAchievementCount={0}
      />,
    );

    const missionIcon = document.querySelector("img");
    expect(missionIcon?.getAttribute("src")).toContain("mission_fallback.svg");
  });

  it("達成回数が0の場合の表示", () => {
    render(
      <Mission
        mission={mockMission}
        userAchievementCount={0}
        totalAchievementCount={0}
      />,
    );

    expect(screen.getByText("みんなで0回達成")).toBeInTheDocument();
  });

  it("イベント日付がnullの場合は日付表示なし", () => {
    const missionWithoutDate = { ...mockMission, event_date: null };

    render(
      <Mission
        mission={missionWithoutDate}
        userAchievementCount={0}
        totalAchievementCount={5}
      />,
    );

    expect(screen.queryByText(/開催/)).not.toBeInTheDocument();
  });
});
