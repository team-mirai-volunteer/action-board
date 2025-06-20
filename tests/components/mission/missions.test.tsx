import React from "react";
import Missions from "../../../components/mission/missions";

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

describe("Missions", () => {
  it("ミッション一覧の正常レンダリング", async () => {
    const missionsComponent = await Missions({
      userId: "test-id",
      showAchievedMissions: true,
    });
    expect(missionsComponent.type).toBe("div");
    expect(missionsComponent.props.className).toContain("max-w-6xl");
  });

  it("空のミッションリスト処理", async () => {
    const missionsComponent = await Missions({
      userId: null,
      showAchievedMissions: false,
    });
    expect(
      missionsComponent.props.children.props.children[0].props.children[0].props
        .children,
    ).toContain("ミッション");
  });
});
