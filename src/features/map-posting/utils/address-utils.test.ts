import {
  buildAddressFromGeocode,
  convertISO3166ToPrefecture,
} from "./address-utils";

describe("convertISO3166ToPrefecture", () => {
  it("JP-13を東京都に変換する", () => {
    expect(convertISO3166ToPrefecture("JP-13")).toBe("東京都");
  });

  it("JP-01を北海道に変換する", () => {
    expect(convertISO3166ToPrefecture("JP-01")).toBe("北海道");
  });

  it("JP-27を大阪府に変換する", () => {
    expect(convertISO3166ToPrefecture("JP-27")).toBe("大阪府");
  });

  it("JP-47を沖縄県に変換する", () => {
    expect(convertISO3166ToPrefecture("JP-47")).toBe("沖縄県");
  });

  it("存在しないコードにはnullを返す", () => {
    expect(convertISO3166ToPrefecture("JP-99")).toBeNull();
  });

  it("空文字にはnullを返す", () => {
    expect(convertISO3166ToPrefecture("")).toBeNull();
  });
});

describe("buildAddressFromGeocode", () => {
  it("完全な住所データから全フィールドを組み立てる", () => {
    const result = buildAddressFromGeocode({
      "ISO3166-2-lvl4": "JP-13",
      city: "新宿区",
      suburb: "西新宿",
      neighbourhood: "二丁目",
      road: "国道20号",
      house_number: "8-1",
      postcode: "163-8001",
    });
    expect(result).toEqual({
      prefecture: "東京都",
      city: "新宿区",
      address: "西新宿二丁目国道20号8-1",
      postcode: "163-8001",
    });
  });

  it("ISO3166コードがない場合はprovinceから都道府県を取得する", () => {
    const result = buildAddressFromGeocode({
      province: "東京都",
      city: "渋谷区",
    });
    expect(result.prefecture).toBe("東京都");
    expect(result.city).toBe("渋谷区");
  });

  it("ISO3166コードがない場合はstateから都道府県を取得する", () => {
    const result = buildAddressFromGeocode({
      state: "大阪府",
    });
    expect(result.prefecture).toBe("大阪府");
  });

  it("ISO3166コードが不明な場合はprovinceにフォールバックする", () => {
    const result = buildAddressFromGeocode({
      "ISO3166-2-lvl4": "JP-99",
      province: "テスト県",
    });
    expect(result.prefecture).toBe("テスト県");
  });

  it("市区町村がcity + city_districtの場合", () => {
    const result = buildAddressFromGeocode({
      city: "横浜市",
      city_district: "中区",
    });
    expect(result.city).toBe("横浜市中区");
  });

  it("町村のみの場合", () => {
    const result = buildAddressFromGeocode({
      town: "箱根町",
    });
    expect(result.city).toBe("箱根町");
  });

  it("villageのみの場合", () => {
    const result = buildAddressFromGeocode({
      village: "十津川村",
    });
    expect(result.city).toBe("十津川村");
  });

  it("詳細住所がquarterとroadの場合", () => {
    const result = buildAddressFromGeocode({
      quarter: "1番地",
      road: "中央通り",
    });
    expect(result.address).toBe("1番地中央通り");
  });

  it("全フィールドが空の場合はすべてnullを返す", () => {
    const result = buildAddressFromGeocode({});
    expect(result).toEqual({
      prefecture: null,
      city: null,
      address: null,
      postcode: null,
    });
  });

  it("postcodeのみの場合", () => {
    const result = buildAddressFromGeocode({
      postcode: "100-0001",
    });
    expect(result).toEqual({
      prefecture: null,
      city: null,
      address: null,
      postcode: "100-0001",
    });
  });
});
