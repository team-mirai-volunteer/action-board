import { render, screen } from "@testing-library/react";
import type React from "react";
import { MissionAchievementTotalCard } from "./total-card";

jest.mock("@/components/ui/card", () => ({
  Card: ({
    children,
    className,
  }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
}));

describe("MissionAchievementTotalCard", () => {
  describe("基本的な表示", () => {
    it("総達成数が正しく表示される", () => {
      render(<MissionAchievementTotalCard totalCount={15} />);

      expect(screen.getByText("15")).toBeInTheDocument();
      expect(screen.getByText("回")).toBeInTheDocument();
    });

    it("総達成数ラベルが表示される", () => {
      render(<MissionAchievementTotalCard totalCount={10} />);

      expect(screen.getByText("総達成数")).toBeInTheDocument();
    });

    it("トロフィー絵文字が表示される", () => {
      render(<MissionAchievementTotalCard totalCount={5} />);

      expect(screen.getByText("🏆")).toBeInTheDocument();
    });

    it("Cardコンポーネントが使用される", () => {
      render(<MissionAchievementTotalCard totalCount={1} />);

      expect(screen.getByTestId("card")).toBeInTheDocument();
    });
  });

  describe("様々な値での表示", () => {
    it("総達成数が0の場合も正しく表示される", () => {
      render(<MissionAchievementTotalCard totalCount={0} />);

      expect(screen.getByText("0")).toBeInTheDocument();
      expect(screen.getByText("回")).toBeInTheDocument();
    });

    it("総達成数が大きい数値の場合も正しく表示される", () => {
      render(<MissionAchievementTotalCard totalCount={1000} />);

      expect(screen.getByText("1000")).toBeInTheDocument();
      expect(screen.getByText("回")).toBeInTheDocument();
    });

    it("総達成数が1の場合も正しく表示される", () => {
      render(<MissionAchievementTotalCard totalCount={1} />);

      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("回")).toBeInTheDocument();
    });
  });

  describe("レイアウトとスタイル", () => {
    it("適切なCardのCSSクラスが設定される", () => {
      render(<MissionAchievementTotalCard totalCount={25} />);

      const card = screen.getByTestId("card");
      expect(card).toHaveClass(
        "relative",
        "overflow-hidden",
        "border-2",
        "border-emerald-200",
        "rounded-2xl",
        "shadow-sm",
        "transition-all",
        "duration-300",
        "p-4",
        "bg-gradient-to-br",
        "from-white",
        "to-emerald-50",
      );
    });

    it("装飾的な背景要素が存在する", () => {
      const { container } = render(
        <MissionAchievementTotalCard totalCount={8} />,
      );

      const decorativeElement = container.querySelector(
        ".absolute.top-0.right-0.w-32.h-32.bg-gradient-to-br.from-emerald-200.to-teal-200.rounded-full.opacity-20.-mr-16.-mt-16",
      );
      expect(decorativeElement).toBeInTheDocument();
    });

    it("メインコンテンツエリアの構造が正しい", () => {
      const { container } = render(
        <MissionAchievementTotalCard totalCount={12} />,
      );

      const relativeContainer = container.querySelector(
        ".relative.flex.justify-between.items-center",
      );
      expect(relativeContainer).toBeInTheDocument();

      const leftSection = container.querySelector(".flex.items-center.gap-1");
      expect(leftSection).toBeInTheDocument();

      const rightSection = container.querySelector(
        ".flex.items-baseline.gap-1",
      );
      expect(rightSection).toBeInTheDocument();
    });

    it("総達成数の数字に適切なグラデーションスタイルが適用される", () => {
      const { container } = render(
        <MissionAchievementTotalCard totalCount={42} />,
      );

      const countNumber = container.querySelector(
        ".text-3xl.font-bold.text-transparent.bg-clip-text.bg-gradient-to-r.from-emerald-600.to-teal-600",
      );
      expect(countNumber).toBeInTheDocument();
      expect(countNumber).toHaveTextContent("42");
    });

    it("ラベルとアイコンに適切なスタイルが適用される", () => {
      const { container } = render(
        <MissionAchievementTotalCard totalCount={7} />,
      );

      const trophy = container.querySelector(".text-gray-700");
      expect(trophy).toBeInTheDocument();
      expect(trophy).toHaveTextContent("🏆");

      const label = container.querySelector(
        ".text-base.font-bold.text-gray-700",
      );
      expect(label).toBeInTheDocument();
      expect(label).toHaveTextContent("総達成数");

      const unit = container.querySelector(".text-xl.font-bold.text-gray-700");
      expect(unit).toBeInTheDocument();
      expect(unit).toHaveTextContent("回");
    });
  });

  describe("視覚的な階層", () => {
    it("数字が最も目立つスタイルになっている", () => {
      const { container } = render(
        <MissionAchievementTotalCard totalCount={99} />,
      );

      const countNumber = container.querySelector(".text-3xl");
      const label = container.querySelector(".text-base");
      const unit = container.querySelector(".text-xl");

      expect(countNumber).toBeInTheDocument();
      expect(label).toBeInTheDocument();
      expect(unit).toBeInTheDocument();
    });
  });
});
