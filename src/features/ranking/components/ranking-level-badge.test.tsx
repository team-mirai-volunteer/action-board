import { render, screen } from "@testing-library/react";
import type React from "react";
import { LevelBadge } from "./ranking-level-badge";

jest.mock("@/components/ui/badge", () => ({
  Badge: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
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

  describe("エッジケース", () => {
    it("負のレベルでもエラーにならない", () => {
      render(<LevelBadge level={-5} />);

      expect(screen.getByText("Lv.-5")).toBeInTheDocument();
    });

    it("非常に大きなレベル値でもエラーにならない", () => {
      render(<LevelBadge level={999} />);

      expect(screen.getByText("Lv.999")).toBeInTheDocument();
    });
  });
});
