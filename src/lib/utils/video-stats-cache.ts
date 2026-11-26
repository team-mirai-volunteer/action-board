import "server-only";

import { unstable_cache } from "next/cache";

/**
 * ホームの外部メトリクス（get-metrics.ts の `next: { revalidate: 3600 }`）と同じ 1 時間。
 * 再生数は日次スナップショットなので、この間隔でも画面上の数字はほぼ変わらない。
 */
export const VIDEO_STATS_REVALIDATE_SECONDS = 60 * 60;

export function cacheVideoStatsQuery<Args extends unknown[], Result>(
  key: string,
  fn: (...args: Args) => Promise<Result>,
): (...args: Args) => Promise<Result> {
  return unstable_cache(fn, [key], {
    revalidate: VIDEO_STATS_REVALIDATE_SECONDS,
  });
}

export function toCount(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}
