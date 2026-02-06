import {
  getDistrictDefaultZoom,
  isValidDistrict,
  JP_TO_EN_DISTRICT,
  POSTER_DISTRICT_MAP,
  VALID_EN_DISTRICTS,
  VALID_JP_DISTRICTS,
} from "./poster-district-shugin-2026";

describe("getDistrictDefaultZoom", () => {
  test("returns correct zoom for chiba-5", () => {
    expect(getDistrictDefaultZoom("chiba-5")).toBe(13);
  });

  test("returns correct zoom for tokyo-2", () => {
    expect(getDistrictDefaultZoom("tokyo-2")).toBe(13);
  });

  test("returns correct zoom for kyoto-2", () => {
    expect(getDistrictDefaultZoom("kyoto-2")).toBe(13);
  });

  test("returns a number for every district key", () => {
    for (const key of VALID_EN_DISTRICTS) {
      expect(typeof getDistrictDefaultZoom(key)).toBe("number");
    }
  });
});

describe("isValidDistrict", () => {
  test("returns true for valid district key chiba-5", () => {
    expect(isValidDistrict("chiba-5")).toBe(true);
  });

  test("returns true for valid district key tokyo-7", () => {
    expect(isValidDistrict("tokyo-7")).toBe(true);
  });

  test("returns true for valid district key tokyo-26", () => {
    expect(isValidDistrict("tokyo-26")).toBe(true);
  });

  test("returns false for invalid district key", () => {
    expect(isValidDistrict("osaka-1")).toBe(false);
  });

  test("returns false for empty string", () => {
    expect(isValidDistrict("")).toBe(false);
  });

  test("returns false for undefined cast to string", () => {
    expect(isValidDistrict("undefined")).toBe(false);
  });

  test("returns true for all defined district keys", () => {
    for (const key of VALID_EN_DISTRICTS) {
      expect(isValidDistrict(key)).toBe(true);
    }
  });
});

describe("POSTER_DISTRICT_MAP", () => {
  test("all districts have required properties", () => {
    for (const [, district] of Object.entries(POSTER_DISTRICT_MAP)) {
      expect(district).toHaveProperty("jp");
      expect(district).toHaveProperty("prefecture");
      expect(district).toHaveProperty("center");
      expect(district).toHaveProperty("defaultZoom");
      expect(district.center).toHaveLength(2);
    }
  });
});

describe("JP_TO_EN_DISTRICT", () => {
  test("maps Japanese name to English key correctly", () => {
    expect(JP_TO_EN_DISTRICT["千葉5区"]).toBe("chiba-5");
    expect(JP_TO_EN_DISTRICT["東京2区"]).toBe("tokyo-2");
    expect(JP_TO_EN_DISTRICT["京都2区"]).toBe("kyoto-2");
  });

  test("returns undefined for invalid Japanese name", () => {
    expect(JP_TO_EN_DISTRICT["大阪1区"]).toBeUndefined();
  });
});

describe("VALID_JP_DISTRICTS / VALID_EN_DISTRICTS", () => {
  test("both arrays have same length as POSTER_DISTRICT_MAP", () => {
    const mapLength = Object.keys(POSTER_DISTRICT_MAP).length;
    expect(VALID_JP_DISTRICTS).toHaveLength(mapLength);
    expect(VALID_EN_DISTRICTS).toHaveLength(mapLength);
  });
});
