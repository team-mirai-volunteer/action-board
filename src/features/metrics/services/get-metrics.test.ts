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

  // validation関数は独立しているため、単体でテスト実施。正常系はfetch系で確認されるため、異常系のみ確認
  describe("validateDonationData / validateSupporterData", () => {
    it("異常系: データがnullの場合、falseを返す", () => {
      const resultDonation = validateDonationData(null);
      expect(resultDonation).toBe(false);

      const resultSupporter = validateSupporterData(null);
      expect(resultSupporter).toBe(false);
    });

    it("異常系: 必須フィールドが欠落している場合、falseを返す", () => {
      const invalidData = {
        last24hCount: 2,
        updatedAt: new Date().toISOString(),
      };
      const resultDonation = validateDonationData(invalidData);
      expect(resultDonation).toBe(false);

      const resultSupporter = validateSupporterData(invalidData);
      expect(resultSupporter).toBe(false);
    });

    it("異常系: フィールドの型が不正な場合、falseを返す", () => {
      const invalidData = {
        totalCount: "10", // 型が文字列
        last24hCount: 2,
        updatedAt: new Date().toISOString(),
      };
      const resultDonation = validateDonationData(invalidData);
      expect(resultDonation).toBe(false);

      const resultSupporter = validateSupporterData(invalidData);
      expect(resultSupporter).toBe(false);
    });

    it("異常系: フィールドの値が負の値の場合、falseを返す", () => {
      const invalidData = {
        totalCount: 2,
        last24hCount: -10, // 負の値
        updatedAt: new Date().toISOString(),
      };
      const resultDonation = validateDonationData(invalidData);
      expect(resultDonation).toBe(false);

      const resultSupporter = validateSupporterData(invalidData);
      expect(resultSupporter).toBe(false);
    });

    it("異常系: updatedAtが無効な日付形式の場合、falseを返す", () => {
      const invalidData = {
        totalCount: 10,
        last24hCount: 2,
        updatedAt: "invalid-date", // 無効な日付
      };
      const resultDonation = validateDonationData(invalidData);
      expect(resultDonation).toBe(false);

      const resultSupporter = validateSupporterData(invalidData);
      expect(resultSupporter).toBe(false);
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
