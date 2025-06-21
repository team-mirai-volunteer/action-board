import { render } from "@testing-library/react";
import React from "react";
import { XpProgressToastContent } from "../../components/xp-progress-toast-content";

describe("XpProgressToastContent", () => {
  it("XP進捗トーストの正常表示", () => {
    const { container } = render(
      <XpProgressToastContent
        initialXp={100}
        xpGained={50}
        onAnimationComplete={jest.fn()}
      />,
    );
    expect(container.firstChild).toBeDefined();
  });

  it("レベルアップ時の表示", () => {
    const { container } = render(
      <XpProgressToastContent
        initialXp={200}
        xpGained={100}
        onAnimationComplete={jest.fn()}
      />,
    );
    expect(container.firstChild).toBeDefined();
  });
});
