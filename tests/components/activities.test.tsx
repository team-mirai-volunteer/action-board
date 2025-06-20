import React from "react";
import Activities from "../../components/activities";

jest.mock("../../lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve({ data: [] })),
        })),
      })),
    })),
  })),
}));

jest.mock("../../components/activity-timeline", () => ({
  ActivityTimeline: () => React.createElement("div", null, "Activity Timeline"),
}));

describe("Activities", () => {
  it("アクティビティコンポーネントの正常レンダリング", async () => {
    const activitiesComponent = await Activities();
    expect(activitiesComponent.type).toBe("div");
    expect(activitiesComponent.props.className).toContain("max-w-6xl");
  });

  it("活動タイムラインタイトルの表示", async () => {
    const activitiesComponent = await Activities();
    expect(
      activitiesComponent.props.children.props.children[0].props.children[0]
        .props.children,
    ).toBe("⏰ 活動タイムライン");
  });
});
