import React from "react";
import MissionPage from "../../../../app/missions/[id]/page";

jest.mock("../../../../lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() =>
        Promise.resolve({ data: { user: { id: "test-id" } } }),
      ),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() =>
            Promise.resolve({
              data: { id: "mission-id", title: "Test Mission" },
            }),
          ),
        })),
      })),
    })),
  })),
}));

describe("Mission Page", () => {
  it("ミッションページの正常レンダリング", async () => {
    const missionPage = await MissionPage({ params: { id: "test-mission" } });
    expect(missionPage.type).toBe("div");
    expect(missionPage.props.className).toContain("container");
  });

  it("ミッションページパラメータ処理", async () => {
    const missionPage = await MissionPage({
      params: { id: "another-mission" },
    });
    expect(missionPage.type).toBe("div");
  });
});
