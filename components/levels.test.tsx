import { render, screen } from "@testing-library/react";
import React from "react";
import Levels from "./levels";

jest.mock("@/lib/services/userLevel", () => ({
  getUserLevel: jest.fn(() =>
    Promise.resolve({
      level: 2,
      current_xp: 100,
      xp_to_next_level: 200,
    }),
  ),
}));

jest.mock("@/lib/services/users", () => ({
  getProfile: jest.fn(() =>
    Promise.resolve({
      id: "test-user-id",
      name: "テストユーザー",
      address_prefecture: "東京都",
      avatar_url: null,
    }),
  ),
}));

describe("Levels", () => {
  describe("基本的な表示", () => {
    it("レベル一覧が正しくレンダリングされる", async () => {
      const result = await Levels({ userId: "test-user-id" });
      render(result);

      expect(result).toBeDefined();
    });

    it("ユーザーレベル情報が取得される", async () => {
      await Levels({ userId: "test-user-id" });

      expect(require("@/lib/services/users").getProfile).toHaveBeenCalledWith(
        "test-user-id",
      );
      expect(
        require("@/lib/services/userLevel").getUserLevel,
      ).toHaveBeenCalledWith("test-user-id");
    });
  });
});
