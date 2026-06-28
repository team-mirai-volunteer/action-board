/**
 * テキスト検索に必要な最小限のボード情報
 */
interface SearchableBoard {
  id: string;
  number: string | number | null;
  name: string | null;
  address: string | null;
  city: string | null;
}

/** 検索を開始する最小文字数 */
export const POSTER_SEARCH_MIN_QUERY_LENGTH = 2;

/** ドロップダウンに表示する検索結果の最大件数 */
export const POSTER_SEARCH_MAX_RESULTS = 10;

/**
 * ポスター掲示板を番号・名前・住所・市区町村・ID で部分一致検索する。
 *
 * - 大文字小文字を区別しない
 * - 複数フィールドを OR 検索
 * - 最小 {@link POSTER_SEARCH_MIN_QUERY_LENGTH} 文字から検索を開始する
 *   (それ未満のクエリは空配列を返す)
 * - 入力順を保ったまま最大 {@link POSTER_SEARCH_MAX_RESULTS} 件を返す
 *
 * ID を対象に含めるのは、行政からの異常報告が掲示板 ID で行われるため
 * (issue #911 のコメント要望)。
 */
export function searchPosterBoards<T extends SearchableBoard>(
  boards: T[],
  query: string,
): T[] {
  const normalized = query.trim().toLowerCase();
  if (normalized.length < POSTER_SEARCH_MIN_QUERY_LENGTH) {
    return [];
  }

  const results: T[] = [];
  for (const board of boards) {
    const fields: (string | number | null)[] = [
      board.number,
      board.name,
      board.address,
      board.city,
      board.id,
    ];
    const matched = fields.some(
      (value) =>
        value !== null && String(value).toLowerCase().includes(normalized),
    );
    if (matched) {
      results.push(board);
      if (results.length >= POSTER_SEARCH_MAX_RESULTS) {
        break;
      }
    }
  }
  return results;
}
