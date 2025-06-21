import React from "react";
import FeaturedMissions from "../../../components/mission/FeaturedMissions";

jest.mock("../../../lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            order: jest.fn(() => ({
              not: jest.fn(() => Promise.resolve({ data: [] })),
            })),
          })),
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
    expect(featuredMissionsComponent).toBeDefined();
  });

  it("空のミッションリスト処理", async () => {
    const featuredMissionsComponent = await FeaturedMissions({
      userId: undefined,
      showAchievedMissions: false,
    });
    expect(featuredMissionsComponent).toBeDefined();
  });
});
