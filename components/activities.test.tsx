import { render, screen } from "@testing-library/react";
import React from "react";
import Activities from "./activities";

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    })),
  })),
}));

describe("Activities", () => {
  describe("基本的な表示", () => {
    it("コンポーネントが正しくレンダリングされる", async () => {
      render(await Activities());

      expect(screen.getByText("⏰ 活動タイムライン")).toBeInTheDocument();
    });

    it("説明文が表示される", async () => {
      render(await Activities());

      expect(
        screen.getByText("リアルタイムで更新される活動記録"),
      ).toBeInTheDocument();
    });
  });
});
