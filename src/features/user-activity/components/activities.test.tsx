import { render, screen } from "@testing-library/react";
import Activities from "./activities";

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
