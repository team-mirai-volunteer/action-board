/**
 * Supabase の !inner JOIN 結果を正規化する。
 * JOIN 結果が配列の場合は先頭要素、単一オブジェクトの場合はそのまま返す。
 * null/undefined の場合は null を返す。
 */
export function normalizeJoinResult<T>(
  data: T | T[] | null | undefined,
): T | null {
  if (data == null) {
    return null;
  }
  if (Array.isArray(data)) {
    return data[0] ?? null;
  }
  return data;
}

/**
 * null/undefined/空文字列を除外して、指定セパレータで結合する。
 * 結合後の文字列が空の場合は undefined を返す。
 */
export function joinNonEmptyStrings(
  separator: string,
  ...values: (string | undefined | null)[]
): string | undefined {
  const filtered = values.filter(
    (v): v is string => typeof v === "string" && v.length > 0,
  );
  return filtered.length > 0 ? filtered.join(separator) : undefined;
}
