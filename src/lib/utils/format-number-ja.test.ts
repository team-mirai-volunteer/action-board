import { formatNumberJa, formatNumberJaShort } from "./format-number-ja";

describe("formatNumberJa", () => {
  describe("null値", () => {
    test("nullの場合はハイフンを返す", () => {
      expect(formatNumberJa(null)).toBe("-");
    });
  });

  describe("1万未満の数値", () => {
    test("0を返す", () => {
      expect(formatNumberJa(0)).toBe("0");
    });

    test("9,999をカンマ区切りで返す", () => {
      expect(formatNumberJa(9999)).toBe("9,999");
    });

    test("1をそのまま返す", () => {
      expect(formatNumberJa(1)).toBe("1");
    });

    test("999をカンマ区切りで返す", () => {
      expect(formatNumberJa(999)).toBe("999");
    });

    test("1,000をカンマ区切りで返す", () => {
      expect(formatNumberJa(1000)).toBe("1,000");
    });
  });

  describe("1万以上1億未満の数値", () => {
    test("10000は1万と表示する", () => {
      expect(formatNumberJa(10000)).toBe("1万");
    });

    test("15000は1.5万と表示する", () => {
      expect(formatNumberJa(15000)).toBe("1.5万");
    });

    test("100000は10万と表示する", () => {
      expect(formatNumberJa(100000)).toBe("10万");
    });

    test("1000000は100万と表示する", () => {
      expect(formatNumberJa(1000000)).toBe("100万");
    });

    test("12345は1.2万と表示する", () => {
      expect(formatNumberJa(12345)).toBe("1.2万");
    });
  });

  describe("1億以上の数値", () => {
    test("100000000は1億と表示する", () => {
      expect(formatNumberJa(100000000)).toBe("1億");
    });

    test("120000000は1.2億と表示する", () => {
      expect(formatNumberJa(120000000)).toBe("1.2億");
    });

    test("1000000000は10億と表示する", () => {
      expect(formatNumberJa(1000000000)).toBe("10億");
    });
  });

  describe("負の数値", () => {
    test("-9999はカンマ区切りで返す", () => {
      expect(formatNumberJa(-9999)).toBe("-9,999");
    });

    test("-10000は-1万と表示する", () => {
      expect(formatNumberJa(-10000)).toBe("-1万");
    });

    test("-15000は-1.5万と表示する", () => {
      expect(formatNumberJa(-15000)).toBe("-1.5万");
    });

    test("-100000000は-1億と表示する", () => {
      expect(formatNumberJa(-100000000)).toBe("-1億");
    });
  });
});

describe("formatNumberJaShort", () => {
  describe("1万未満の数値", () => {
    test("0をそのまま返す", () => {
      expect(formatNumberJaShort(0)).toBe("0");
    });

    test("9999をカンマ区切りで返す", () => {
      expect(formatNumberJaShort(9999)).toBe("9,999");
    });

    test("5000をカンマ区切りで返す", () => {
      expect(formatNumberJaShort(5000)).toBe("5,000");
    });
  });

  describe("1万以上1億未満の数値", () => {
    test("10000は1万と表示する", () => {
      expect(formatNumberJaShort(10000)).toBe("1万");
    });

    test("15000は2万と表示する（四捨五入）", () => {
      expect(formatNumberJaShort(15000)).toBe("2万");
    });

    test("100000は10万と表示する", () => {
      expect(formatNumberJaShort(100000)).toBe("10万");
    });

    test("54321は5万と表示する", () => {
      expect(formatNumberJaShort(54321)).toBe("5万");
    });
  });

  describe("1億以上の数値", () => {
    test("100000000は1億と表示する", () => {
      expect(formatNumberJaShort(100000000)).toBe("1億");
    });

    test("250000000は3億と表示する（四捨五入）", () => {
      expect(formatNumberJaShort(250000000)).toBe("3億");
    });

    test("1000000000は10億と表示する", () => {
      expect(formatNumberJaShort(1000000000)).toBe("10億");
    });
  });

  describe("負の数値", () => {
    test("-9999をカンマ区切りで返す", () => {
      expect(formatNumberJaShort(-9999)).toBe("-9,999");
    });

    test("-10000は-1万と表示する", () => {
      expect(formatNumberJaShort(-10000)).toBe("-1万");
    });

    test("-100000000は-1億と表示する", () => {
      expect(formatNumberJaShort(-100000000)).toBe("-1億");
    });
  });
});
