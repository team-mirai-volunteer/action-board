import {
  fetchAchievementData,
  fetchDonationData,
  fetchRegistrationData,
  fetchSupporterData,
  validateDonationData,
  validateSupporterData,
} from "@/features/metrics/services/get-metrics";
import type {
  DonationData,
  SupporterData,
} from "@/features/metrics/types/metrics-types";
import { createClient } from "@/lib/supabase/client";

jest.mock("@/lib/supabase/client");
jest.mock("@/features/metrics/services/get-metrics", () =>
  jest.requireActual("@/features/metrics/services/get-metrics"),
);

// fetchのモック設定
const mockFetch = (data: SupporterData | DonationData) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    headers: { get: () => "application/json" },
    json: async () => data,
  });
};

// Supabaseクライアントのモック設定
const setupMockSupabaseClient = (
  dataset: { created_at: string }[],
  capturedGteIsoRef: { value: string | null },
) => {
  (createClient as jest.Mock).mockReturnValue({
    from: () => ({
      select: () => ({
        count: dataset.length,
        gte: (_columnName: string, thresholdISO: string) => {
          capturedGteIsoRef.value = thresholdISO;
          const count = dataset.filter(
            (data) => new Date(data.created_at) >= new Date(thresholdISO),
          ).length;
          return Promise.resolve({ count });
        },
      }),
    }),
  });
};

describe("get-metrics", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch as typeof fetch;
    jest.clearAllMocks();
  });

  const createDataset = (thresholdISO: string) => [
    { created_at: new Date(Date.parse(thresholdISO) - 1).toISOString() }, // 除外
    { created_at: thresholdISO }, // 含む
    { created_at: new Date(Date.parse(thresholdISO) + 1).toISOString() }, // 含む
  ];

  const setupTestEnvironment = (
    now: string,
    dataset: { created_at: string }[],
  ) => {
    const DAY = 24 * 60 * 60 * 1000; // ミリ秒
    jest.useFakeTimers().setSystemTime(new Date(now));

    const thresholdISO = new Date(Date.now() - DAY).toISOString();
    const capturedGteIsoRef = { value: null };

    setupMockSupabaseClient(dataset, capturedGteIsoRef);

    return { thresholdISO, capturedGteIsoRef };
  };

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
          updatedAt: new Date().toISOString(),
        }),
      ).toBe(false);
    });

    it("異常系: last24hCountが欠落している場合、falseを返す", () => {
      expect(
        validateSupporterData({
          totalCount: 10,
          updatedAt: new Date().toISOString(),
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
          updatedAt: new Date().toISOString(),
        }),
      ).toBe(false);
    });

    it("異常系: totalCountが負の場合、falseを返す", () => {
      expect(
        validateSupporterData({
          totalCount: -1,
          last24hCount: 2,
          updatedAt: new Date().toISOString(),
        }),
      ).toBe(false);
    });

    it("異常系: last24hCountが負の場合、falseを返す", () => {
      expect(
        validateSupporterData({
          totalCount: 10,
          last24hCount: -1,
          updatedAt: new Date().toISOString(),
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
          updatedAt: new Date().toISOString(),
        }),
      ).toBe(false);
    });

    it("異常系: last24hAmountが欠落している場合、falseを返す", () => {
      expect(
        validateDonationData({
          totalAmount: 1000,
          updatedAt: new Date().toISOString(),
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
          updatedAt: new Date().toISOString(),
        }),
      ).toBe(false);
    });

    it("異常系: totalAmountが負の場合、falseを返す", () => {
      expect(
        validateDonationData({
          totalAmount: -1,
          last24hAmount: 200,
          updatedAt: new Date().toISOString(),
        }),
      ).toBe(false);
    });

    it("異常系: last24hAmountが負の場合、falseを返す", () => {
      expect(
        validateDonationData({
          totalAmount: 1000,
          last24hAmount: -1,
          updatedAt: new Date().toISOString(),
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

  // fetch関数はシンプルなデータ取得処理であるため、正常系のみ確認する。
  describe("fetchSupporterData", () => {
    it("正常系: JSONデータを返す", async () => {
      const data: SupporterData = {
        totalCount: 10,
        last24hCount: 2,
        updatedAt: new Date().toISOString(),
      };
      mockFetch(data);

      const result = await fetchSupporterData();
      expect(result).toEqual(data);
    });

    describe("fetchDonationData", () => {
      it("正常系: JSONデータを返す", async () => {
        const data: DonationData = {
          totalAmount: 1000,
          last24hAmount: 200,
          updatedAt: new Date().toISOString(),
        };
        mockFetch(data);

        const result = await fetchDonationData();
        expect(result).toEqual(data);
      });
    });

    describe("fetchAchievementData", () => {
      it("正常系: 24時間以内(created_at>=閾値)のみを集計する", async () => {
        const now = "2025-01-02T12:00:00Z";
        jest.useFakeTimers().setSystemTime(new Date(now));

        // 24時間前のISO8601形式の日時を計算
        const dataset = createDataset(
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        );
        const { thresholdISO, capturedGteIsoRef } = setupTestEnvironment(
          now,
          dataset,
        );

        const result = await fetchAchievementData();

        expect(result).toEqual({ totalCount: 3, todayCount: 2 });
        expect(capturedGteIsoRef.value).toBe(thresholdISO);

        jest.useRealTimers();
      });
    });

    describe("fetchRegistrationData", () => {
      it("正常系: 24時間以内(created_at>=閾値)のみを集計する", async () => {
        const now = "2025-01-02T12:00:00Z";
        jest.useFakeTimers().setSystemTime(new Date(now));

        // 24時間前のISO8601形式の日時を計算
        const dataset = createDataset(
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        );
        const { thresholdISO, capturedGteIsoRef } = setupTestEnvironment(
          now,
          dataset,
        );

        setupMockSupabaseClient(dataset, capturedGteIsoRef);

        const result = await fetchRegistrationData();

        expect(result).toEqual({ totalCount: 3, todayCount: 2 });
        expect(capturedGteIsoRef.value).toBe(thresholdISO);

        jest.useRealTimers();
      });
    });
  });
});
