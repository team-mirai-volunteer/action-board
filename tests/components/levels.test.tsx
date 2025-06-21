import React from "react";
import Levels from "../../components/levels";

jest.mock("../../lib/services/users", () => ({
  getProfile: jest.fn(() =>
    Promise.resolve({
      id: "test-id",
      name: "テストユーザー",
      avatar_url: null,
      address_prefecture: "東京都",
    }),
  ),
}));

jest.mock("../../lib/services/userLevel", () => ({
  getUserLevel: jest.fn(() => Promise.resolve({ level: 1, xp: 50 })),
}));

describe("Levels", () => {
  it("レベル表示の正常レンダリング", async () => {
    const levelsComponent = await Levels({ userId: "test-user-id" });
    expect(levelsComponent).toBeDefined();
  });

  it("XP表示の確認", async () => {
    const levelsComponent = await Levels({
      userId: "test-user-id",
      hideProgress: false,
    });
    expect(levelsComponent).toBeDefined();
  });
});
