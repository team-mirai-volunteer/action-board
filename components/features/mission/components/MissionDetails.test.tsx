import { MissionDetails } from "@/components/features/mission/components/MissionDetails";
import type { Tables } from "@/lib/types/supabase";
import { render, screen } from "@testing-library/react";
import React from "react";

jest.mock(
  "@/components/features/mission/components/YouTubeSubscribeButton",
  () => ({
    YouTubeSubscribeButton: function MockYouTubeSubscribeButton({
      channelId,
    }: { channelId: string }) {
      return (
        <div data-testid="youtube-button">YouTube Button: {channelId}</div>
      );
    },
  }),
);

jest.mock("@/lib/constants", () => ({
  YOUTUBE_MISSION_CONFIG: {
    MISSION_ID: "youtube-mission-id",
    CHANNEL_ID: "test-channel-id",
  },
}));

jest.mock("@/lib/formatter", () => ({
  dateFormatter: jest.fn(
    (date: Date) =>
      `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`,
  ),
}));

const mockMission: Tables<"missions"> = {
  id: "test-mission-1",
  slug: "test-mission-1",
  title: "テストミッション",
  content: "<p>テストミッションの<strong>詳細</strong>内容</p>",
  difficulty: 2,
  icon_url: "/test-icon.svg",
  event_date: "2025-06-22",
  max_achievement_count: null,
  is_featured: true,
  is_hidden: false,
  featured_importance: null,
  required_artifact_type: "NONE",
  artifact_label: null,
  ogp_image_url: null,
  created_at: "2025-06-22T00:00:00Z",
  updated_at: "2025-06-22T00:00:00Z",
};

describe("MissionDetails", () => {
  it("ミッション詳細が正しく表示される", () => {
    render(<MissionDetails mission={mockMission} />);

    expect(screen.getByText("テストミッション")).toBeInTheDocument();
    expect(screen.getByText("イベント日: 2025年6月22日")).toBeInTheDocument();
  });

  it("アイコンが表示される", () => {
    render(<MissionDetails mission={mockMission} />);

    const icon = screen.getByAltText("テストミッション");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("src", "/test-icon.svg");
  });

  it("アイコンがない場合は表示されない", () => {
    const missionWithoutIcon = { ...mockMission, icon_url: null };

    render(<MissionDetails mission={missionWithoutIcon} />);

    expect(screen.queryByAltText("テストミッション")).not.toBeInTheDocument();
  });

  it("イベント日付がない場合は日付バッジが表示されない", () => {
    const missionWithoutDate = { ...mockMission, event_date: null };

    render(<MissionDetails mission={missionWithoutDate} />);

    expect(
      screen.queryByText("イベント日: 2025年6月22日"),
    ).not.toBeInTheDocument();
  });

  it("ミッション内容がHTMLとして表示される", () => {
    render(<MissionDetails mission={mockMission} />);

    const contentElement = document.querySelector(".mission-content");
    expect(contentElement).toBeInTheDocument();
    expect(contentElement?.innerHTML).toBe(
      "<p>テストミッションの<strong>詳細</strong>内容</p>",
    );
  });

  it("YouTubeミッションの場合はYouTubeボタンが表示される", () => {
    const youtubeMission = { ...mockMission, id: "youtube-mission-id" };

    render(<MissionDetails mission={youtubeMission} />);

    expect(screen.getByTestId("youtube-button")).toBeInTheDocument();
    expect(
      screen.getByText("YouTube Button: test-channel-id"),
    ).toBeInTheDocument();
  });

  it("通常のミッションの場合はYouTubeボタンが表示されない", () => {
    render(<MissionDetails mission={mockMission} />);

    expect(screen.queryByTestId("youtube-button")).not.toBeInTheDocument();
  });

  it("ミッション内容がnullの場合でもエラーにならない", () => {
    const missionWithoutContent = { ...mockMission, content: null };

    render(<MissionDetails mission={missionWithoutContent} />);

    const contentElement = document.querySelector(".mission-content");
    expect(contentElement).toBeInTheDocument();
    expect(contentElement?.innerHTML).toBe("");
  });
});
