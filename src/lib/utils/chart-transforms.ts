/**
 * Format chart data items by converting date strings to Japanese short format (e.g. "1月5日").
 * Used across action-stats, tiktok-stats chart components.
 */
export function formatChartDates<T extends { date: string }>(
  data: T[],
): (Omit<T, "date"> & { date: string })[] {
  return data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
    }),
  }));
}

/**
 * Create a Map from an array using a specified key property for fast lookup.
 * Used in prefecture-team-map for ranking data lookup by prefecture name.
 */
export function createLookupMap<T, K extends keyof T>(
  items: T[],
  key: K,
): Map<T[K], T> {
  return new Map(items.map((item) => [item[key], item]));
}
