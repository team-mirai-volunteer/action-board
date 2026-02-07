/**
 * CLI引数パースとユーティリティ関数
 * scripts/sync-youtube-videos.ts から切り出し
 */

// 日付文字列をISO 8601形式に変換（YouTube APIが要求する形式）
export function toISOTimestamp(dateStr: string): string {
  // すでにタイムゾーン情報がある場合はそのまま返す
  if (dateStr.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  // YYYY-MM-DD形式の場合、T00:00:00Zを付加
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return `${dateStr}T00:00:00Z`;
  }
  // その他の場合はDateオブジェクトを経由して変換
  return new Date(dateStr).toISOString();
}

// CLIオプションのパース
export function parseArgs(argv: string[] = process.argv.slice(2)) {
  const getArg = (name: string): string | undefined => {
    const index = argv.indexOf(name);
    return index !== -1 && argv[index + 1] ? argv[index + 1] : undefined;
  };

  const maxResultsArg = getArg("--max-results");
  const publishedAfterArg = getArg("--published-after");
  const publishedBeforeArg = getArg("--published-before");

  return {
    isDryRun: argv.includes("--dry-run"),
    isBackfill: argv.includes("--backfill"),
    maxResults: maxResultsArg ? Number.parseInt(maxResultsArg, 10) : undefined,
    publishedAfter: publishedAfterArg
      ? toISOTimestamp(publishedAfterArg)
      : undefined,
    publishedBefore: publishedBeforeArg
      ? toISOTimestamp(publishedBeforeArg)
      : undefined,
  };
}
