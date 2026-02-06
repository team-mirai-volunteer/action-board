import {
  validateDonationData,
  validateSupporterData,
} from "./metrics-validators";

describe("validateSupporterData", () => {
  it("正常系: 有効なデータの場合、trueを返す", () => {
    expect(
      validateSupporterData({
        totalCount: 1000,
        last24hCount: 50,
        updatedAt: "2024-06-01T12:00:00Z",
      }),
    ).toBe(true);
  });

  it("正常系: カウントがゼロの場合、trueを返す", () => {
    expect(
      validateSupporterData({
        totalCount: 0,
        last24hCount: 0,
        updatedAt: "2024-01-01T00:00:00Z",
      }),
    ).toBe(true);
  });

  it("異常系: nullの場合、falseを返す", () => {
    expect(validateSupporterData(null)).toBe(false);
  });

  it("異常系: undefinedの場合、falseを返す", () => {
    expect(validateSupporterData(undefined)).toBe(false);
  });

  it("異常系: 文字列の場合、falseを返す", () => {
    expect(validateSupporterData("string")).toBe(false);
  });

  it("異常系: totalCountが欠落している場合、falseを返す", () => {
    expect(
      validateSupporterData({
        last24hCount: 2,
        updatedAt: "2024-06-01T12:00:00Z",
      }),
    ).toBe(false);
  });

  it("異常系: last24hCountが欠落している場合、falseを返す", () => {
    expect(
      validateSupporterData({
        totalCount: 10,
        updatedAt: "2024-06-01T12:00:00Z",
      }),
    ).toBe(false);
  });

  it("異常系: updatedAtが欠落している場合、falseを返す", () => {
    expect(validateSupporterData({ totalCount: 10, last24hCount: 2 })).toBe(
      false,
    );
  });

  it("異常系: totalCountが文字列の場合、falseを返す", () => {
    expect(
      validateSupporterData({
        totalCount: "10",
        last24hCount: 2,
        updatedAt: "2024-06-01T12:00:00Z",
      }),
    ).toBe(false);
  });

  it("異常系: totalCountが負の場合、falseを返す", () => {
    expect(
      validateSupporterData({
        totalCount: -1,
        last24hCount: 2,
        updatedAt: "2024-06-01T12:00:00Z",
      }),
    ).toBe(false);
  });

  it("異常系: last24hCountが負の場合、falseを返す", () => {
    expect(
      validateSupporterData({
        totalCount: 10,
        last24hCount: -1,
        updatedAt: "2024-06-01T12:00:00Z",
      }),
    ).toBe(false);
  });

  it("異常系: updatedAtが無効な日付形式の場合、falseを返す", () => {
    expect(
      validateSupporterData({
        totalCount: 10,
        last24hCount: 2,
        updatedAt: "invalid-date",
      }),
    ).toBe(false);
  });
});

describe("validateDonationData", () => {
  it("正常系: 有効なデータの場合、trueを返す", () => {
    expect(
      validateDonationData({
        totalAmount: 500000,
        last24hAmount: 10000,
        updatedAt: "2024-06-01T12:00:00Z",
      }),
    ).toBe(true);
  });

  it("正常系: 金額がゼロの場合、trueを返す", () => {
    expect(
      validateDonationData({
        totalAmount: 0,
        last24hAmount: 0,
        updatedAt: "2024-01-01T00:00:00Z",
      }),
    ).toBe(true);
  });

  it("異常系: nullの場合、falseを返す", () => {
    expect(validateDonationData(null)).toBe(false);
  });

  it("異常系: undefinedの場合、falseを返す", () => {
    expect(validateDonationData(undefined)).toBe(false);
  });

  it("異常系: 数値の場合、falseを返す", () => {
    expect(validateDonationData(42)).toBe(false);
  });

  it("異常系: totalAmountが欠落している場合、falseを返す", () => {
    expect(
      validateDonationData({
        last24hAmount: 200,
        updatedAt: "2024-06-01T12:00:00Z",
      }),
    ).toBe(false);
  });

  it("異常系: last24hAmountが欠落している場合、falseを返す", () => {
    expect(
      validateDonationData({
        totalAmount: 1000,
        updatedAt: "2024-06-01T12:00:00Z",
      }),
    ).toBe(false);
  });

  it("異常系: updatedAtが欠落している場合、falseを返す", () => {
    expect(
      validateDonationData({ totalAmount: 1000, last24hAmount: 200 }),
    ).toBe(false);
  });

  it("異常系: totalAmountが文字列の場合、falseを返す", () => {
    expect(
      validateDonationData({
        totalAmount: "500000",
        last24hAmount: 200,
        updatedAt: "2024-06-01T12:00:00Z",
      }),
    ).toBe(false);
  });

  it("異常系: totalAmountが負の場合、falseを返す", () => {
    expect(
      validateDonationData({
        totalAmount: -1,
        last24hAmount: 200,
        updatedAt: "2024-06-01T12:00:00Z",
      }),
    ).toBe(false);
  });

  it("異常系: last24hAmountが負の場合、falseを返す", () => {
    expect(
      validateDonationData({
        totalAmount: 1000,
        last24hAmount: -1,
        updatedAt: "2024-06-01T12:00:00Z",
      }),
    ).toBe(false);
  });

  it("異常系: updatedAtが無効な日付形式の場合、falseを返す", () => {
    expect(
      validateDonationData({
        totalAmount: 1000,
        last24hAmount: 200,
        updatedAt: "not-a-date",
      }),
    ).toBe(false);
  });
});
