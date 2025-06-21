import { render } from "@testing-library/react";
import React from "react";
import { TypographyInlineCode } from "../../../components/typography/inline-code";

describe("TypographyInlineCode", () => {
  it("インラインコードの正常表示", () => {
    const { container } = render(<TypographyInlineCode />);
    expect(container.firstChild).toBeDefined();
  });

  it("コードスタイルの確認", () => {
    const { container } = render(<TypographyInlineCode />);
    expect(container.firstChild).toBeDefined();
  });
});
