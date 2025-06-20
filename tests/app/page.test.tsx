import React from "react";
import Home from "../../app/page";

jest.mock("../../lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: null } })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null })),
        })),
      })),
    })),
  })),
}));

jest.mock("../../lib/services/levelUpNotification", () => ({
  checkLevelUpNotification: jest.fn(() =>
    Promise.resolve({ shouldNotify: false }),
  ),
}));

jest.mock("../../lib/services/missions", () => ({
  hasFeaturedMissions: jest.fn(() => Promise.resolve(false)),
}));

jest.mock(
  "../../components/hero",
  () => () => React.createElement("div", null, "Hero"),
);
jest.mock(
  "../../components/metrics",
  () => () => React.createElement("div", null, "Metrics"),
);

describe("Home", () => {
  it("ホームページの正常レンダリング", async () => {
    const homeComponent = await Home();
    expect(homeComponent.type).toBe("div");
    expect(homeComponent.props.className).toContain("flex flex-col");
  });

  it("メトリクスセクションの表示", async () => {
    const homeComponent = await Home();
    expect(homeComponent.props.children[2].type).toBe("section");
  });
});
