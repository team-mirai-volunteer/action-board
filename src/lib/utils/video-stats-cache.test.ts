jest.mock("server-only", () => ({}));
jest.mock("next/cache", () => ({
  unstable_cache: jest.fn((fn: (...args: unknown[]) => unknown) => fn),
}));

import { unstable_cache } from "next/cache";
import {
  cacheVideoStatsQuery,
  toCount,
  VIDEO_STATS_REVALIDATE_SECONDS,
} from "./video-stats-cache";

describe("cacheVideoStatsQuery", () => {
  test("get-metrics.ts と同じ 1 時間でキャッシュする", () => {
    const query = async (value: string) => value;
    cacheVideoStatsQuery("youtube-stats-summary", query);

    expect(VIDEO_STATS_REVALIDATE_SECONDS).toBe(3600);
    expect(unstable_cache).toHaveBeenCalledWith(
      query,
      ["youtube-stats-summary"],
      {
        revalidate: 3600,
      },
    );
  });
});

describe("toCount", () => {
  test("null と数値文字列を数に直す", () => {
    expect(toCount(null)).toBe(0);
    expect(toCount(undefined)).toBe(0);
    expect(toCount("12")).toBe(12);
    expect(toCount(4)).toBe(4);
    expect(toCount("nope")).toBe(0);
  });
});
