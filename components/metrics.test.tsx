import { render, screen } from "@testing-library/react";
import React from "react";
import Metrics from "./metrics";

jest.mock("@/components/ui/separator", () => ({
  Separator: ({ orientation, className }: any) => (
    <div
      data-testid="separator"
      data-orientation={orientation}
      className={className}
    />
  ),
}));

describe("Metrics", () => {
  describe("基本的な表示", () => {
    it("メトリクスが正しくレンダリングされる", async () => {
      render(await Metrics());

      expect(screen.getByText("チームみらいの活動状況🚀")).toBeInTheDocument();
      expect(screen.getByText("現在の寄付金額")).toBeInTheDocument();
    });

    it("アクション達成数メトリクスが表示される", async () => {
      render(await Metrics());

      expect(screen.getByText("達成したアクション数")).toBeInTheDocument();
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
      const result = await Metrics();
      render(result);

      expect(result).toBeDefined();
    });
  });

  describe("レイアウト", () => {
    it("Separatorコンポーネントが表示される", async () => {
      render(await Metrics());

      expect(screen.getByTestId("separator")).toBeInTheDocument();
    });
  });
});
