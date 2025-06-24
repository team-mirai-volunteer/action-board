import { render, screen } from "@testing-library/react";
import type React from "react";
import { LevelBadge } from "./ranking-level-badge";

jest.mock("@/components/ui/badge", () => ({
  Badge: ({
    children,
    className,
  }: { children: React.ReactNode; className?: string }) => (
    <span className={className} data-testid="badge">
      {children}
    </span>
  ),
}));

describe("LevelBadge", () => {
  describe("基本的な表示", () => {
    it("レベルが正しく表示される", () => {
      render(<LevelBadge level={15} />);

      expect(screen.getByText("Lv.15")).toBeInTheDocument();
    });

    it("showPrefixがfalseの場合は数字のみ表示される", () => {
      render(<LevelBadge level={20} showPrefix={false} />);

      expect(screen.getByText("20")).toBeInTheDocument();
      expect(screen.queryByText("Lv.20")).not.toBeInTheDocument();
    });

    it("showPrefixがtrueの場合はLv.付きで表示される", () => {
      render(<LevelBadge level={25} showPrefix={true} />);

      expect(screen.getByText("Lv.25")).toBeInTheDocument();
    });

    it("showPrefixのデフォルト値はtrueである", () => {
      render(<LevelBadge level={30} />);

      expect(screen.getByText("Lv.30")).toBeInTheDocument();
    });
  });

  describe("レベル別スタイル", () => {
    it("レベル40以上の場合は適切なクラスが設定される", () => {
      render(<LevelBadge level={40} />);

      const badge = screen.getByTestId("badge");
      expect(badge).toHaveClass("bg-emerald-600", "text-white");
    });

    it("レベル50の場合も40以上のスタイルが適用される", () => {
      render(<LevelBadge level={50} />);

      const badge = screen.getByTestId("badge");
      expect(badge).toHaveClass("bg-emerald-600", "text-white");
    });

    it("レベル30以上40未満の場合は適切なクラスが設定される", () => {
      render(<LevelBadge level={35} />);

      const badge = screen.getByTestId("badge");
      expect(badge).toHaveClass("bg-emerald-500", "text-white");
    });

    it("レベル30の場合", () => {
      render(<LevelBadge level={30} />);

      const badge = screen.getByTestId("badge");
      expect(badge).toHaveClass("bg-emerald-500", "text-white");
    });

    it("レベル20以上30未満の場合は適切なクラスが設定される", () => {
      render(<LevelBadge level={25} />);

      const badge = screen.getByTestId("badge");
      expect(badge).toHaveClass("bg-emerald-200", "text-emerald-800");
    });

    it("レベル20の場合", () => {
      render(<LevelBadge level={20} />);

      const badge = screen.getByTestId("badge");
      expect(badge).toHaveClass("bg-emerald-200", "text-emerald-800");
    });

    it("レベル10以上20未満の場合は適切なクラスが設定される", () => {
      render(<LevelBadge level={15} />);

      const badge = screen.getByTestId("badge");
      expect(badge).toHaveClass("bg-emerald-100", "text-emerald-700");
    });

    it("レベル10の場合", () => {
      render(<LevelBadge level={10} />);

      const badge = screen.getByTestId("badge");
      expect(badge).toHaveClass("bg-emerald-100", "text-emerald-700");
    });

    it("レベル10未満の場合は適切なクラスが設定される", () => {
      render(<LevelBadge level={5} />);

      const badge = screen.getByTestId("badge");
      expect(badge).toHaveClass("bg-emerald-50", "text-emerald-600");
    });

    it("レベル0の場合", () => {
      render(<LevelBadge level={0} />);

      const badge = screen.getByTestId("badge");
      expect(badge).toHaveClass("bg-emerald-50", "text-emerald-600");
    });
  });

  describe("カスタムクラス", () => {
    it("カスタムクラスが追加される", () => {
      render(<LevelBadge level={15} className="custom-class" />);

      const badge = screen.getByTestId("badge");
      expect(badge).toHaveClass("custom-class");
    });

    it("基本クラスとカスタムクラスが両方設定される", () => {
      render(<LevelBadge level={15} className="custom-class" />);

      const badge = screen.getByTestId("badge");
      expect(badge).toHaveClass(
        "bg-emerald-100",
        "text-emerald-700",
        "px-3",
        "py-1",
        "rounded-full",
        "font-medium",
        "custom-class",
      );
    });

    it("classNameが空文字の場合でもエラーにならない", () => {
      render(<LevelBadge level={15} className="" />);

      const badge = screen.getByTestId("badge");
      expect(badge).toHaveClass("bg-emerald-100", "text-emerald-700");
    });
  });

  describe("エッジケース", () => {
    it("負のレベルでもエラーにならない", () => {
      render(<LevelBadge level={-5} />);

      expect(screen.getByText("Lv.-5")).toBeInTheDocument();
      const badge = screen.getByTestId("badge");
      expect(badge).toHaveClass("bg-emerald-50", "text-emerald-600");
    });

    it("非常に大きなレベル値でもエラーにならない", () => {
      render(<LevelBadge level={999} />);

      expect(screen.getByText("Lv.999")).toBeInTheDocument();
      const badge = screen.getByTestId("badge");
      expect(badge).toHaveClass("bg-emerald-600", "text-white");
    });
  });

  describe("基本クラス", () => {
    it("基本クラスが常に設定される", () => {
      render(<LevelBadge level={15} />);

      const badge = screen.getByTestId("badge");
      expect(badge).toHaveClass("px-3", "py-1", "rounded-full", "font-medium");
    });
  });
});
