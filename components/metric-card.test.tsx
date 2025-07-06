import { render, screen } from "@testing-library/react";
import React from "react";
import { MetricCard } from "./metric-card";

jest.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
}));

describe("MetricCard", () => {
  const mockProps = {
    title: "総ユーザー数",
    value: 1234,
    unit: "人",
  };

  describe("基本的な表示", () => {
    it("タイトルが正しく表示される", () => {
      render(<MetricCard {...mockProps} />);

      expect(screen.getByText("総ユーザー数")).toBeInTheDocument();
    });

    it("値が正しく表示される", () => {
      render(<MetricCard {...mockProps} />);

      expect(screen.getByText("1,234")).toBeInTheDocument();
    });

    it("単位が正しく表示される", () => {
      render(<MetricCard {...mockProps} />);

      expect(screen.getByText("人")).toBeInTheDocument();
    });
  });

  describe("オプショナルプロパティ", () => {
    it("todayValueがある場合は今日の値が表示される", () => {
      render(<MetricCard {...mockProps} todayValue={50} todayUnit="人" />);

      expect(screen.getByText("総ユーザー数")).toBeInTheDocument();
      expect(screen.getByText("1,234")).toBeInTheDocument();
      expect(screen.getByText("+50")).toBeInTheDocument();
      expect(screen.getByText("1日で")).toBeInTheDocument();
    });

    it("todayValueがない場合は今日の値が非表示", () => {
      const { container } = render(<MetricCard {...mockProps} />);

      expect(screen.getByText("総ユーザー数")).toBeInTheDocument();
      expect(screen.getByText("1,234")).toBeInTheDocument();

      const todaySection = container.querySelector('[class*="opacity-0"]');
      expect(todaySection).toBeInTheDocument();
    });

    it("todayValueが負の値の場合", () => {
      render(<MetricCard {...mockProps} todayValue={-10} todayUnit="人" />);

      expect(screen.getByText("-10")).toBeInTheDocument();
    });
  });

  describe("様々な値での表示", () => {
    it("数値が0の場合", () => {
      const { container } = render(<MetricCard {...mockProps} value={0} />);

      const valueElement = container.querySelector('[class*="text-4xl"]');
      expect(valueElement).toHaveTextContent("0");
    });

    it("数値がnullの場合", () => {
      const { container } = render(<MetricCard {...mockProps} value={null} />);

      const valueElement = container.querySelector('[class*="text-4xl"]');
      expect(valueElement).toHaveTextContent("0");
    });

    it("大きな数値の場合", () => {
      render(<MetricCard {...mockProps} value={999999} />);

      expect(screen.getByText("999,999")).toBeInTheDocument();
    });

    it("小数点を含む値の場合", () => {
      render(<MetricCard {...mockProps} value={85.5} />);

      expect(screen.getByText("85.5")).toBeInTheDocument();
    });
  });

  describe("コンポーネント構造", () => {
    it("Cardコンポーネントが使用される", () => {
      render(<MetricCard {...mockProps} />);

      expect(screen.getByTestId("card")).toBeInTheDocument();
    });
  });
});
