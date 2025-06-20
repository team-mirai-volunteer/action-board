import React from "react";
import { EnvVarWarning } from "../../components/env-var-warning";

describe("EnvVarWarning", () => {
  it("環境変数警告の正常表示", () => {
    const warning = EnvVarWarning();
    expect(warning.type).toBe("div");
    expect(warning.props.className).toContain("flex gap-4");
  });

  it("無効化されたボタンの確認", () => {
    const warning = EnvVarWarning();
    expect(warning.props.children[1].props.children[1].props.disabled).toBe(
      true,
    );
  });
});
