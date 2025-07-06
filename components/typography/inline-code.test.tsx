import { render, screen } from "@testing-library/react";
import React from "react";
import { TypographyInlineCode } from "./inline-code";

describe("TypographyInlineCode", () => {
  it("コンポーネントが正しくレンダリングされる", () => {
    render(<TypographyInlineCode />);

    const codeElement = screen.getByText("@radix-ui/react-alert-dialog");
    expect(codeElement).toBeInTheDocument();
  });

  it("適切なHTMLタグが使用される", () => {
    render(<TypographyInlineCode />);

    const codeElement = screen.getByText("@radix-ui/react-alert-dialog");
    expect(codeElement.tagName).toBe("CODE");
  });

  it("固定のテキストが表示される", () => {
    render(<TypographyInlineCode />);

    expect(
      screen.getByText("@radix-ui/react-alert-dialog"),
    ).toBeInTheDocument();
  });
});
