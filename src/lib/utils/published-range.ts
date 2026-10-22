/**
 * 動画の公開日フィルタ。
 * キャッシュキーに null を載せないため、未指定は空文字にする。
 */
export interface PublishedRange {
  publishedFrom: string;
  publishedTo: string;
}

/**
 * 既存の `.gte(published_at)` / `.lt(published_at)` と同じ半開区間を作る。
 * 終了日はサーバのローカル暦で 1 日進め、その時刻を排他上限にする。
 */
export function toPublishedRange(
  startDate?: Date,
  endDate?: Date,
): PublishedRange {
  let publishedTo = "";
  if (endDate) {
    const endOfDay = new Date(endDate);
    endOfDay.setDate(endOfDay.getDate() + 1);
    publishedTo = endOfDay.toISOString();
  }

  return {
    publishedFrom: startDate ? startDate.toISOString() : "",
    publishedTo,
  };
}

/** キャッシュキーの空文字を、RPC の「条件なし」に戻す。 */
export function fromCacheDate(value: string): string | undefined {
  return value ? value : undefined;
}
