import { render, screen } from "@testing-library/react";
import React from "react";
import Metrics from "./metrics";

jest.mock("@/components/metric-card", () => ({
  MetricCard: ({ title, value, unit, todayValue, todayUnit }: any) => (
    <div data-testid="metric-card">
      <h3>{title}</h3>
      <div>
        {value} {unit}
      </div>
      <div>
        今日: {todayValue} {todayUnit}
      </div>
    </div>
  ),
}));

describe("Metrics", () => {
  describe("基本的な表示", () => {
    it("メトリクスが正しくレンダリングされる", async () => {
      render(await Metrics());

      expect(screen.getAllByTestId("metric-card")).toHaveLength(2);
    });

    it("アクション達成数メトリクスが表示される", async () => {
      render(await Metrics());

      expect(
        screen.getByText("みんなで達成したアクション数"),
      ).toBeInTheDocument();
    });

    it("参加者数メトリクスが表示される", async () => {
      render(await Metrics());

      expect(screen.getByText("アクションボード参加者")).toBeInTheDocument();
    });
  });

  describe("データ取得", () => {
    it("Supabaseクライアントが正しく呼び出される", async () => {
      await Metrics();

      expect(require("@/lib/supabase/server").createClient).toHaveBeenCalled();
    });
  });

  describe("エラーハンドリング", () => {
    it("データ取得エラー時の処理", async () => {
      const mockCreateClient = require("@/lib/supabase/server").createClient;
      mockCreateClient.mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            count: jest.fn(() =>
              Promise.resolve({ count: null, error: { message: "エラー" } }),
            ),
          })),
        })),
      });

      render(await Metrics());

      expect(screen.getByText("0")).toBeInTheDocument();
    });
  });

  describe("レイアウト", () => {
    it("グリッドレイアウトが適用される", async () => {
      const { container } = render(await Metrics());

      const gridContainer = container.querySelector(".grid");
      expect(gridContainer).toBeInTheDocument();
    });
  });
});
