import {
  calculateDefaultScrollPosition,
  getButtonText,
  isFinalScreen,
  sanitizeHtml,
} from "./utils";

describe("sanitizeHtml", () => {
  describe("許可タグの保持", () => {
    test("<br>タグが保持される", () => {
      expect(sanitizeHtml("テスト<br>テスト")).toBe("テスト<br>テスト");
      expect(sanitizeHtml("テスト<br/>テスト")).toBe("テスト<br/>テスト");
      expect(sanitizeHtml("テスト<br />テスト")).toBe("テスト<br />テスト");
    });

    test("<wbr>タグが保持される", () => {
      expect(sanitizeHtml("テスト<wbr>テスト")).toBe("テスト<wbr>テスト");
    });

    test("<a>タグが保持される", () => {
      expect(sanitizeHtml('<a href="https://example.com">リンク</a>')).toBe(
        '<a href="https://example.com">リンク</a>',
      );
    });

    test("SVG関連タグが保持される", () => {
      const svgInput =
        "<svg xmlns='http://www.w3.org/2000/svg'><path d='M0 0'/><polyline points='1 2'/><line x1='0' y1='0'/></svg>";
      expect(sanitizeHtml(svgInput)).toBe(svgInput);
    });
  });

  describe("改行変換", () => {
    test("\\nが<br>に変換される", () => {
      expect(sanitizeHtml("行1\n行2")).toBe("行1<br>行2");
    });

    test("複数の\\nが全て変換される", () => {
      expect(sanitizeHtml("行1\n行2\n行3")).toBe("行1<br>行2<br>行3");
    });
  });

  describe("不許可タグの除去", () => {
    test("<script>タグが除去される", () => {
      expect(sanitizeHtml("<script>alert('xss')</script>")).toBe(
        "alert('xss')",
      );
    });

    test("<img>タグが除去される", () => {
      expect(sanitizeHtml('<img src="evil.png">')).toBe("");
    });

    test("<iframe>タグが除去される", () => {
      expect(sanitizeHtml('<iframe src="evil.html"></iframe>')).toBe("");
    });

    test("<div>タグが除去される", () => {
      expect(sanitizeHtml("<div>コンテンツ</div>")).toBe("コンテンツ");
    });
  });

  describe("XSS対策", () => {
    test("javascript:スキームが除去される", () => {
      expect(sanitizeHtml('<a href="javascript:alert(1)">リンク</a>')).toBe(
        '<a href="alert(1)">リンク</a>',
      );
    });

    test("大文字混合のjavascript:スキームが除去される", () => {
      expect(sanitizeHtml("JavaScript:alert(1)")).toBe("alert(1)");
      expect(sanitizeHtml("JAVASCRIPT:alert(1)")).toBe("alert(1)");
    });

    test("onclick属性が除去される", () => {
      expect(sanitizeHtml('onclick="alert(1)"')).toBe('"alert(1)"');
    });

    test("onmouseover属性が除去される", () => {
      expect(sanitizeHtml('onmouseover = "alert(1)"')).toBe(' "alert(1)"');
    });

    test("大文字混合のイベントハンドラが除去される", () => {
      expect(sanitizeHtml('OnClick="alert(1)"')).toBe('"alert(1)"');
    });
  });

  describe("エッジケース", () => {
    test("空文字列はそのまま返される", () => {
      expect(sanitizeHtml("")).toBe("");
    });

    test("タグなしのプレーンテキストはそのまま返される", () => {
      expect(sanitizeHtml("プレーンテキスト")).toBe("プレーンテキスト");
    });
  });
});

describe("isFinalScreen", () => {
  test("最終画面でtrueを返す", () => {
    expect(isFinalScreen(4, 5)).toBe(true);
  });

  test("最終画面以外でfalseを返す", () => {
    expect(isFinalScreen(0, 5)).toBe(false);
    expect(isFinalScreen(2, 5)).toBe(false);
  });

  test("totalDialogues=1の場合、currentDialogue=0で最終画面", () => {
    expect(isFinalScreen(0, 1)).toBe(true);
  });

  test("先頭画面でfalseを返す（複数ダイアログ時）", () => {
    expect(isFinalScreen(0, 3)).toBe(false);
  });
});

describe("getButtonText", () => {
  test("currentDialogue=0かつisWelcome=trueで「説明を聞く」を返す", () => {
    expect(getButtonText(0, true, false)).toBe("説明を聞く");
  });

  test("isFinal=trueで「ミッションを探す 🔍」を返す", () => {
    expect(getButtonText(3, false, true)).toBe("ミッションを探す 🔍");
  });

  test("currentDialogue=0かつisWelcome=trueかつisFinal=trueでSTARTが優先される", () => {
    expect(getButtonText(0, true, true)).toBe("説明を聞く");
  });

  test("通常時は「次へ」を返す", () => {
    expect(getButtonText(1, false, false)).toBe("次へ");
    expect(getButtonText(2, true, false)).toBe("次へ");
  });

  test("isWelcome=trueでもcurrentDialogue!=0なら「次へ」を返す", () => {
    expect(getButtonText(1, true, false)).toBe("次へ");
  });
});

describe("calculateDefaultScrollPosition", () => {
  const createMockContainer = (
    scrollHeight: number,
    clientHeight: number,
  ): HTMLElement => {
    return {
      scrollHeight,
      clientHeight,
    } as unknown as HTMLElement;
  };

  test("scrollHeight - clientHeightがmaxScroll未満の場合、差分を返す", () => {
    const container = createMockContainer(400, 200);
    expect(calculateDefaultScrollPosition(container)).toBe(200);
  });

  test("scrollHeight - clientHeightがmaxScrollを超える場合、maxScrollを返す", () => {
    const container = createMockContainer(1000, 200);
    expect(calculateDefaultScrollPosition(container)).toBe(300);
  });

  test("カスタムmaxScrollが指定された場合、そちらを使用する", () => {
    const container = createMockContainer(1000, 200);
    expect(calculateDefaultScrollPosition(container, 100)).toBe(100);
  });

  test("scrollHeightとclientHeightが等しい場合、0を返す", () => {
    const container = createMockContainer(500, 500);
    expect(calculateDefaultScrollPosition(container)).toBe(0);
  });

  test("maxScrollと差分が等しい場合、その値を返す", () => {
    const container = createMockContainer(600, 300);
    expect(calculateDefaultScrollPosition(container)).toBe(300);
  });
});
