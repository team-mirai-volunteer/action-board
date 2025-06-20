import React from "react";
import Levels from "../../components/levels";

jest.mock("../../lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() =>
        Promise.resolve({ data: { user: { id: "test-id" } } }),
      ),
    },
  })),
}));

jest.mock("../../lib/services/userLevel", () => ({
  getOrInitializeUserLevel: jest.fn(() =>
    Promise.resolve({ level: 1, xp: 50 }),
  ),
}));

describe("Levels", () => {
  it("レベル表示の正常レンダリング", async () => {
    const levelsComponent = await Levels();
    expect(levelsComponent.type).toBe("div");
    expect(levelsComponent.props.className).toContain("flex");
  });

  it("XP表示の確認", async () => {
    const levelsComponent = await Levels();
    expect(levelsComponent.props.children[0].props.children).toContain(
      "レベル",
    );
  });
});
