import React from "react";
import MissionPage from "../../../../app/missions/[id]/page";

describe("Mission Page", () => {
  it("ミッションページの正常レンダリング", async () => {
    const missionPage = await MissionPage({
      params: Promise.resolve({ id: "test-mission" }),
    });
    expect(missionPage.type).toBe("div");
    expect(missionPage.props.className).toContain("p-4");
  });

  it("ミッションページパラメータ処理", async () => {
    const missionPage = await MissionPage({
      params: Promise.resolve({ id: "another-mission" }),
    });
    expect(missionPage.type).toBe("div");
  });
});
