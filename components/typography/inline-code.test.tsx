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

  it("適切なCSSクラスが設定される", () => {
    render(<TypographyInlineCode />);

    const codeElement = screen.getByText("@radix-ui/react-alert-dialog");
    expect(codeElement).toHaveClass(
      "relative",
      "rounded",
      "bg-muted",
      "px-[0.3rem]",
      "py-[0.2rem]",
      "font-mono",
      "text-sm",
      "font-semibold",
    );
  });

  it("固定のテキストが表示される", () => {
    render(<TypographyInlineCode />);

    expect(
      screen.getByText("@radix-ui/react-alert-dialog"),
    ).toBeInTheDocument();
  });
});
