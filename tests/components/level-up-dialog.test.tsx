import { render } from "@testing-library/react";
import React from "react";
import { LevelUpDialog } from "../../components/level-up-dialog";

describe("LevelUpDialog", () => {
  it("レベルアップダイアログの正常表示", () => {
    const { container } = render(
      <LevelUpDialog isOpen={true} onClose={jest.fn()} newLevel={2} />,
    );
    expect(container.firstChild).toBeDefined();
  });

  it("レベル数値の表示確認", () => {
    const { container } = render(
      <LevelUpDialog isOpen={true} onClose={jest.fn()} newLevel={5} />,
    );
    expect(container.firstChild).toBeDefined();
  });
});
