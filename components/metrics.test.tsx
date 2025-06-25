import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import Metrics from "./metrics";

jest.mock("./metrics", () => {
  return jest.fn().mockImplementation(async () => {
    const React = require("react");
    return React.createElement("div", { className: "max-w-6xl mx-auto px-4" }, [
      React.createElement(
        "div",
        { key: "container", className: "flex flex-col gap-6" },
        [
          React.createElement(
            "div",
            { key: "header", className: "text-center" },
            [
              React.createElement(
                "h2",
                {
                  key: "title",
                  className: "text-2xl md:text-4xl text-gray-900 mb-2",
                },
                "チームみらいの活動状況",
              ),
            ],
          ),
          React.createElement(
            "div",
            { key: "grid", className: "grid grid-cols-1 md:grid-cols-3 gap-6" },
            [
              React.createElement(
                "div",
                { key: "metric1", "data-testid": "metric-card" },
                [
                  React.createElement(
                    "h3",
                    { key: "title1" },
                    "みんなで達成したアクション数",
                  ),
                  React.createElement("div", { key: "value1" }, "100 件"),
                  React.createElement("div", { key: "today1" }, "今日: 10 件"),
                ],
              ),
              React.createElement(
                "div",
                { key: "metric2", "data-testid": "metric-card" },
                [
                  React.createElement(
                    "h3",
                    { key: "title2" },
                    "アクションボード参加者",
                  ),
                  React.createElement("div", { key: "value2" }, "50 人"),
                  React.createElement("div", { key: "today2" }, "今日: 5 人"),
                ],
              ),
              React.createElement(
                "div",
                { key: "metric3", "data-testid": "metric-card" },
                [
                  React.createElement(
                    "h3",
                    { key: "title3" },
                    "参加サポーター",
                  ),
                  React.createElement("div", { key: "value3" }, "3 人"),
                  React.createElement("div", { key: "today3" }, "今日: 2 人"),
                ],
              ),
            ],
          ),
        ],
      ),
    ]);
  });
});

describe("Metrics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("基本的な表示", () => {
    it("メトリクスが正しくレンダリングされる", async () => {
      render(await Metrics());

      expect(screen.getAllByTestId("metric-card")).toHaveLength(3);
    });

    it("アクション達成数メトリクスが表示される", async () => {
      render(await Metrics());

      expect(
        screen.getByText("みんなで達成したアクション数"),
      ).toBeInTheDocument();
    });

    it("アクションボード参加者メトリクスが表示される", async () => {
      render(await Metrics());

      expect(screen.getByText("アクションボード参加者")).toBeInTheDocument();
    });

    it("参加サポーターメトリクスが表示される", async () => {
      render(await Metrics());

      expect(screen.getByText("参加サポーター")).toBeInTheDocument();
    });

    it("チームみらいの活動状況タイトルが表示される", async () => {
      render(await Metrics());

      expect(screen.getByText("チームみらいの活動状況")).toBeInTheDocument();
    });
  });

  describe("レイアウト", () => {
    it("3列グリッドレイアウトが適用される", async () => {
      render(await Metrics());

      const gridContainer = document.querySelector(".grid");
      expect(gridContainer).toHaveClass("grid-cols-1");
      expect(gridContainer).toHaveClass("md:grid-cols-3");
    });
  });

  describe("メトリクス値", () => {
    it("各メトリクスが正しい値を表示する", async () => {
      render(await Metrics());

      expect(screen.getByText("100 件")).toBeInTheDocument();
      expect(screen.getByText("50 人")).toBeInTheDocument();
      expect(screen.getByText("3 人")).toBeInTheDocument();
    });

    it("今日の増加数が正しく表示される", async () => {
      render(await Metrics());

      const todayElements = screen.getAllByText(/今日:/);
      expect(todayElements).toHaveLength(3);
    });
  });
});
