import {
  getPrefectureDefaultZoom,
  JP_TO_EN_PREFECTURE,
  POSTER_PREFECTURE_MAP,
  VALID_EN_PREFECTURES,
  VALID_JP_PREFECTURES,
} from "./poster-prefectures";

describe("getPrefectureDefaultZoom", () => {
  test("returns correct zoom for tokyo", () => {
    expect(getPrefectureDefaultZoom("tokyo")).toBe(12);
  });

  test("returns correct zoom for hokkaido", () => {
    expect(getPrefectureDefaultZoom("hokkaido")).toBe(8);
  });

  test("returns correct zoom for osaka", () => {
    expect(getPrefectureDefaultZoom("osaka")).toBe(12);
  });

  test("returns correct zoom for kanagawa", () => {
    expect(getPrefectureDefaultZoom("kanagawa")).toBe(11);
  });

  test("returns a number for every prefecture key", () => {
    for (const key of VALID_EN_PREFECTURES) {
      expect(typeof getPrefectureDefaultZoom(key)).toBe("number");
    }
  });
});

describe("POSTER_PREFECTURE_MAP", () => {
  test("all prefectures have required properties", () => {
    for (const [, pref] of Object.entries(POSTER_PREFECTURE_MAP)) {
      expect(pref).toHaveProperty("jp");
      expect(pref).toHaveProperty("center");
      expect(pref).toHaveProperty("defaultZoom");
      expect(pref.center).toHaveLength(2);
    }
  });

  test("all center coordinates are valid lat/lng ranges", () => {
    for (const [, pref] of Object.entries(POSTER_PREFECTURE_MAP)) {
      const [lat, lng] = pref.center;
      expect(lat).toBeGreaterThanOrEqual(-90);
      expect(lat).toBeLessThanOrEqual(90);
      expect(lng).toBeGreaterThanOrEqual(-180);
      expect(lng).toBeLessThanOrEqual(180);
    }
  });
});

describe("JP_TO_EN_PREFECTURE", () => {
  test("maps Japanese name to English key correctly", () => {
    expect(JP_TO_EN_PREFECTURE["東京都"]).toBe("tokyo");
    expect(JP_TO_EN_PREFECTURE["北海道"]).toBe("hokkaido");
    expect(JP_TO_EN_PREFECTURE["大阪府"]).toBe("osaka");
  });

  test("returns undefined for invalid Japanese name", () => {
    expect(JP_TO_EN_PREFECTURE["沖縄県"]).toBeUndefined();
  });
});

describe("VALID_JP_PREFECTURES / VALID_EN_PREFECTURES", () => {
  test("both arrays have same length as POSTER_PREFECTURE_MAP", () => {
    const mapLength = Object.keys(POSTER_PREFECTURE_MAP).length;
    expect(VALID_JP_PREFECTURES).toHaveLength(mapLength);
    expect(VALID_EN_PREFECTURES).toHaveLength(mapLength);
  });
});
