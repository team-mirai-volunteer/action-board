import React from "react";
import { ActivityTimeline } from "../../components/activity-timeline";

const mockTimeline = [
  {
    id: "1",
    user_id: "user1",
    name: "テストユーザー",
    avatar_url: null,
    address_prefecture: "東京都",
    title: "テストミッション",
    created_at: "2025-01-01T00:00:00Z",
  },
];

describe("ActivityTimeline", () => {
  it("タイムラインアイテムの正常表示", () => {
    const timeline = ActivityTimeline({
      timeline: mockTimeline,
      hasNext: false,
    });
    expect(timeline.type).toBe("div");
    expect(timeline.props.className).toContain("flex flex-col");
  });

  it("空のタイムライン表示", () => {
    const timeline = ActivityTimeline({ timeline: [], hasNext: false });
    expect(timeline.props.children[0].props.children).toBe(
      "活動履歴がありません",
    );
  });
});
