import { getColorForRank, LEGEND_COLORS, NO_DATA_COLOR } from "./color-scale";

describe("getColorForRank", () => {
  describe("有効な順位の場合", () => {
    it("1位は最も濃い青を返す", () => {
      expect(getColorForRank(1)).toBe("#08306b");
    });

    it("47位は最も薄い青を返す", () => {
      expect(getColorForRank(47)).toBe("#f7fbff");
    });

    it("中間の順位はグラデーションの中間色を返す", () => {
      const color25 = getColorForRank(25);
      expect(color25).toBe("#6baed6");
    });

    it("順位が上がるほど濃い色になる", () => {
      const color1 = getColorForRank(1);
      const color47 = getColorForRank(47);
      // 1位の色コードは47位より小さい値（濃い青）
      expect(color1).not.toBe(color47);
    });
  });

  describe("境界値の場合", () => {
    // index = floor(((rank-1) / 47) * 9) なので、グループ境界は rank 7 付近
    it("6位はまだ最初のグループ", () => {
      expect(getColorForRank(6)).toBe("#08306b");
    });

    it("7位で次のグループに移る", () => {
      expect(getColorForRank(7)).toBe("#08519c");
    });
  });

  describe("無効な順位の場合", () => {
    it("0以下はグレーを返す", () => {
      expect(getColorForRank(0)).toBe("#e5e7eb");
      expect(getColorForRank(-1)).toBe("#e5e7eb");
    });

    it("48以上はグレーを返す", () => {
      expect(getColorForRank(48)).toBe("#e5e7eb");
      expect(getColorForRank(100)).toBe("#e5e7eb");
    });
  });
});

describe("NO_DATA_COLOR", () => {
  it("グレー色が定義されている", () => {
    expect(NO_DATA_COLOR).toBe("#e5e7eb");
  });

  it("無効な順位の戻り値と一致する", () => {
    expect(getColorForRank(0)).toBe(NO_DATA_COLOR);
  });
});

describe("LEGEND_COLORS", () => {
  it("9個の色が定義されている", () => {
    expect(LEGEND_COLORS).toHaveLength(9);
  });

  it("最初の色にラベルがある", () => {
    expect(LEGEND_COLORS[0].label).toBe("1位〜");
  });

  it("最後の色にラベルがある", () => {
    const last = LEGEND_COLORS[LEGEND_COLORS.length - 1];
    expect(last.label).toMatch(/\d+位〜/);
  });

  it("中間の色はラベルが空文字", () => {
    expect(LEGEND_COLORS[1].label).toBe("");
    expect(LEGEND_COLORS[4].label).toBe("");
  });
});
