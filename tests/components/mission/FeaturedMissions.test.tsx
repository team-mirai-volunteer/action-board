import React from "react";
import FeaturedMissions from "../../../components/mission/FeaturedMissions";

jest.mock("../../../lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: [] })),
        })),
      })),
    })),
  })),
}));

describe("FeaturedMissions", () => {
  it("フィーチャードミッションの正常レンダリング", async () => {
    const featuredMissionsComponent = await FeaturedMissions({
      userId: "test-id",
      showAchievedMissions: true,
    });
    expect(featuredMissionsComponent.type).toBe("div");
    expect(featuredMissionsComponent.props.className).toContain("max-w-6xl");
  });

  it("空のミッションリスト処理", async () => {
    const featuredMissionsComponent = await FeaturedMissions({
      userId: null,
      showAchievedMissions: false,
    });
    expect(
      featuredMissionsComponent.props.children.props.children[0].props
        .children[0].props.children,
    ).toContain("注目のミッション");
  });
});
