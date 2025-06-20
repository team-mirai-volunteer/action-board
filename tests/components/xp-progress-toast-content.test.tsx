import React from "react";
import { XpProgressToastContent } from "../../components/xp-progress-toast-content";

describe("XpProgressToastContent", () => {
  it("XP進捗トーストの正常表示", () => {
    const toast = XpProgressToastContent({
      xpGained: 50,
      currentLevel: 2,
      nextLevelXp: 200,
      currentXp: 150,
    });
    expect(toast.type).toBe("div");
    expect(toast.props.className).toContain("flex");
  });

  it("レベルアップ時の表示", () => {
    const toast = XpProgressToastContent({
      xpGained: 100,
      currentLevel: 3,
      nextLevelXp: 300,
      currentXp: 300,
    });
    expect(toast.props.children[0].props.children[0].props.children).toContain(
      "+100 XP",
    );
  });
});
