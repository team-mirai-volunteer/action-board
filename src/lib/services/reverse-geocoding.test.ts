import { reverseGeocode } from "./reverse-geocoding";

describe("reverseGeocode", () => {
  const emptyResult = {
    prefecture: null,
    city: null,
    address: null,
    postcode: null,
  };

  let fetchMock: jest.Mock;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it("Nominatim APIを正しいクエリで呼び出す", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ address: {} }),
    });

    await reverseGeocode(35.681, 139.767);

    const [url, init] = fetchMock.mock.calls[0];
    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe(
      "https://nominatim.openstreetmap.org/reverse",
    );
    expect(parsed.searchParams.get("lat")).toBe("35.681");
    expect(parsed.searchParams.get("lon")).toBe("139.767");
    expect(parsed.searchParams.get("format")).toBe("json");
    expect(parsed.searchParams.get("addressdetails")).toBe("1");
    expect(parsed.searchParams.get("accept-language")).toBe("ja");
    expect(init.headers["User-Agent"]).toBe("ActionBoard/1.0");
  });

  it("正常レスポンスを住所情報に変換する", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        address: {
          "ISO3166-2-lvl4": "JP-13",
          city: "千代田区",
          road: "内堀通り",
          house_number: "1-1",
          postcode: "100-0001",
        },
      }),
    });

    const result = await reverseGeocode(35.681, 139.767);

    expect(result).toEqual({
      prefecture: "東京都",
      city: "千代田区",
      address: "内堀通り1-1",
      postcode: "100-0001",
    });
  });

  it("HTTPエラー時は空の結果を返す", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    const result = await reverseGeocode(0, 0);

    expect(result).toEqual(emptyResult);
    expect(errorSpy).toHaveBeenCalledWith("Nominatim API error: 500");
  });

  it("レスポンスボディにerrorが含まれる場合は空の結果を返す", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ error: "Unable to geocode" }),
    });

    const result = await reverseGeocode(0, 0);

    expect(result).toEqual(emptyResult);
    expect(errorSpy).toHaveBeenCalledWith("Nominatim error: Unable to geocode");
  });

  it("addressが含まれない場合は空の結果を返す", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    const result = await reverseGeocode(35.0, 135.0);

    expect(result).toEqual(emptyResult);
  });

  it("fetch自体が例外を投げた場合は空の結果を返す", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));

    const result = await reverseGeocode(0, 0);

    expect(result).toEqual(emptyResult);
    expect(errorSpy).toHaveBeenCalledWith(
      "Reverse geocoding failed:",
      expect.any(Error),
    );
  });
});
