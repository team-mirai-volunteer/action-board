import React from "react";
import { InlineCode } from "../../../components/typography/inline-code";

describe("InlineCode", () => {
  it("インラインコードの正常表示", () => {
    const code = InlineCode({ children: 'console.log("test")' });
    expect(code.type).toBe("code");
    expect(code.props.children).toBe('console.log("test")');
  });

  it("空のコード内容処理", () => {
    const code = InlineCode({ children: "" });
    expect(code.type).toBe("code");
    expect(code.props.className).toContain("bg-muted");
  });
});
