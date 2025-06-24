import { render, screen } from "@testing-library/react";
import React from "react";
import Levels from "./levels";

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  })),
}));

describe("Levels", () => {
  describe("基本的な表示", () => {
    it("レベル一覧が正しくレンダリングされる", async () => {
      const result = await Levels({ userId: "test-user-id" });
      render(result);

      expect(result).toBeDefined();
    });

    it("Supabaseクライアントが呼び出される", async () => {
      await Levels({ userId: "test-user-id" });

      expect(require("@/lib/supabase/server").createClient).toHaveBeenCalled();
    });
  });
});
