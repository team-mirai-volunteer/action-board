import { render, screen } from "@testing-library/react";
import React from "react";
import Metrics from "./metrics";

describe("Metrics", () => {
  describe("基本的な表示", () => {
    it("メトリクスが正しくレンダリングされる", async () => {
      render(await Metrics());

      expect(screen.getByText("チームみらいの活動状況")).toBeInTheDocument();
    });

    it("アクション達成数メトリクスが表示される", async () => {
      render(await Metrics());

      expect(screen.getByText("達成したアクション数")).toBeInTheDocument();
    });

    it("参加者数メトリクスが表示される", async () => {
      render(await Metrics());

      expect(screen.getByText("アクションボード参加者数")).toBeInTheDocument();
    });

    it("サポーター数メトリクスが表示される", async () => {
      render(await Metrics());

      expect(
        screen.getByText("チームみらい参加サポーター数"),
      ).toBeInTheDocument();
    });

    it("寄付金額セクションが表示される", async () => {
      render(await Metrics());

      expect(screen.getByText("現在の寄付金額")).toBeInTheDocument();
      expect(screen.getByText("83,011,000")).toBeInTheDocument();
    });

    it("更新日時が表示される", async () => {
      render(await Metrics());

      expect(
        screen.getByText(/\d{4}\/\d{2}\/\d{2} \d{2}:\d{2} 更新/),
      ).toBeInTheDocument();
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
      const result = await Metrics();
      render(result);

      expect(result).toBeDefined();
    });
  });

  describe("レイアウト", () => {
    it("グリッドレイアウトが適用される", async () => {
      const { container } = render(await Metrics());

      const gridContainer = container.querySelector(".grid-cols-2");
      expect(gridContainer).toBeInTheDocument();
    });

    it("緑色のグラデーション背景が適用される", async () => {
      const { container } = render(await Metrics());

      const gradientContainer = container.querySelector(".bg-gradient-to-br");
      expect(gradientContainer).toBeInTheDocument();
    });
  });
});
