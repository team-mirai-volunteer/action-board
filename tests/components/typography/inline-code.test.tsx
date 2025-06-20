import React from "react";
import { TypographyInlineCode } from "../../../components/typography/inline-code";

describe("TypographyInlineCode", () => {
  it("インラインコードの正常表示", () => {
    const code = TypographyInlineCode();
    expect(code.type).toBe("code");
  });

  it("コードスタイルの確認", () => {
    const code = TypographyInlineCode();
    expect(code.props.className).toContain("relative");
  });
});
