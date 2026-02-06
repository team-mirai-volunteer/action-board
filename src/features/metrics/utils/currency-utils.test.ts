import { parseCurrencyDisplay, safeYenToMan } from "./currency-utils";

describe("safeYenToMan", () => {
  it("nullに対して0を返す", () => {
    expect(safeYenToMan(null)).toBe(0);
  });

  it("undefinedに対して0を返す", () => {
    expect(safeYenToMan(undefined)).toBe(0);
  });

  it("NaNに対して0を返す", () => {
    expect(safeYenToMan(Number.NaN)).toBe(0);
  });

  it("負数に対して0を返す", () => {
    expect(safeYenToMan(-1000)).toBe(0);
  });

  it("0に対して0を返す", () => {
    expect(safeYenToMan(0)).toBe(0);
  });

  it("正数を万単位に変換する", () => {
    expect(safeYenToMan(50000)).toBe(5);
  });

  it("大きな値を万単位に変換する", () => {
    expect(safeYenToMan(123456789)).toBe(12345.6789);
  });

  it("カスタムdivisorを使用できる", () => {
    expect(safeYenToMan(1000, 100)).toBe(10);
  });
});

describe("parseCurrencyDisplay", () => {
  it("億万を含む場合、数値部分と万円を分離する", () => {
    expect(parseCurrencyDisplay("1億456.9万円")).toEqual({
      number: "1億456.9",
      unit: "万円",
    });
  });

  it("億のみの場合、数値部分と億円を分離する", () => {
    expect(parseCurrencyDisplay("1億円")).toEqual({
      number: "1",
      unit: "億円",
    });
  });

  it("万のみの場合、数値部分と万円を分離する", () => {
    expect(parseCurrencyDisplay("456.9万円")).toEqual({
      number: "456.9",
      unit: "万円",
    });
  });

  it("整数の万円を処理する", () => {
    expect(parseCurrencyDisplay("1234万円")).toEqual({
      number: "1234",
      unit: "万円",
    });
  });
});
