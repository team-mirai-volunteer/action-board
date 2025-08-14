import { render } from "@testing-library/react";
import React from "react";
import { LevelProgress } from "./level-progress";

jest.mock("@/components/ui/progress-bar-simple", () => ({
  ProgressBarSimple: ({ currentXp, className }: any) => (
    <div
      className={className}
      data-testid="progress-bar-simple"
      data-current-xp={currentXp}
    >
      Progress Bar Simple: {currentXp} XP
    </div>
  ),
}));

describe("LevelProgress", () => {
  const mockUserLevel = {
    user_id: "test-user-id",
    season_id: "season-123",
    level: 5,
    xp: 750,
    last_notified_level: 1,
    updated_at: "2023-01-01T00:00:00Z",
  };

  describe("基本的な表示", () => {
    it("ProgressBarSimpleコンポーネントが表示される", () => {
      const { container } = render(<LevelProgress userLevel={mockUserLevel} />);

      const progressBar = container.querySelector(
        '[data-testid="progress-bar-simple"]',
      );
      expect(progressBar).toBeInTheDocument();
    });

    it("XP値が正しく渡される", () => {
      const { container } = render(<LevelProgress userLevel={mockUserLevel} />);

      const progressBar = container.querySelector(
        '[data-testid="progress-bar-simple"]',
      );
      expect(progressBar).toHaveAttribute("data-current-xp", "750");
    });

    it("コンポーネントが正しくレンダリングされる", () => {
      const { container } = render(<LevelProgress userLevel={mockUserLevel} />);

      expect(container.textContent).toContain("Progress Bar Simple: 750 XP");
    });
  });

  describe("XP値の処理", () => {
    it("正のXP値が正しく処理される", () => {
      const { container } = render(<LevelProgress userLevel={mockUserLevel} />);

      const progressBar = container.querySelector(
        '[data-testid="progress-bar-simple"]',
      );
      expect(progressBar).toHaveAttribute("data-current-xp", "750");
    });

    it("0のXP値が正しく処理される", () => {
      const zeroUserLevel = {
        ...mockUserLevel,
        xp: 0,
      };
      const { container } = render(<LevelProgress userLevel={zeroUserLevel} />);

      const progressBar = container.querySelector(
        '[data-testid="progress-bar-simple"]',
      );
      expect(progressBar).toHaveAttribute("data-current-xp", "0");
    });

    it("大きなXP値が正しく処理される", () => {
      const highXpUserLevel = {
        ...mockUserLevel,
        xp: 10000,
      };
      const { container } = render(
        <LevelProgress userLevel={highXpUserLevel} />,
      );

      const progressBar = container.querySelector(
        '[data-testid="progress-bar-simple"]',
      );
      expect(progressBar).toHaveAttribute("data-current-xp", "10000");
    });
  });

  describe("エッジケース", () => {
    it("userLevelがnullの場合は0が渡される", () => {
      const { container } = render(<LevelProgress userLevel={null} />);

      const progressBar = container.querySelector(
        '[data-testid="progress-bar-simple"]',
      );
      expect(progressBar).toHaveAttribute("data-current-xp", "0");
      expect(container.textContent).toContain("Progress Bar Simple: 0 XP");
    });

    it("userLevelがundefinedの場合は0が渡される", () => {
      const { container } = render(
        <LevelProgress userLevel={undefined as any} />,
      );

      const progressBar = container.querySelector(
        '[data-testid="progress-bar-simple"]',
      );
      expect(progressBar).toHaveAttribute("data-current-xp", "0");
    });

    it("負のXPの場合も正しく処理される", () => {
      const negativeUserLevel = {
        ...mockUserLevel,
        xp: -100,
      };
      const { container } = render(
        <LevelProgress userLevel={negativeUserLevel} />,
      );

      const progressBar = container.querySelector(
        '[data-testid="progress-bar-simple"]',
      );
      expect(progressBar).toHaveAttribute("data-current-xp", "-100");
    });
  });

  describe("プロパティの伝達", () => {
    it("currentXpプロパティが正しく伝達される", () => {
      const { container } = render(<LevelProgress userLevel={mockUserLevel} />);

      const progressBar = container.querySelector(
        '[data-testid="progress-bar-simple"]',
      );
      expect(progressBar).toHaveAttribute("data-current-xp", "750");
    });

    it("異なるXP値でも正しく伝達される", () => {
      const customUserLevel = {
        ...mockUserLevel,
        xp: 1500,
      };
      const { container } = render(
        <LevelProgress userLevel={customUserLevel} />,
      );

      const progressBar = container.querySelector(
        '[data-testid="progress-bar-simple"]',
      );
      expect(progressBar).toHaveAttribute("data-current-xp", "1500");
    });
  });
});
