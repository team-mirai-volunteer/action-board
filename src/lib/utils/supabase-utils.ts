import type { PostgrestError } from "@supabase/supabase-js";

/**
 * 配列を指定されたサイズのチャンクに分割する
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * 大量のIDに対するクエリをチャンク分割して実行する
 * URL長制限を回避するためのヘルパー関数
 *
 * @example
 * const { data, error } = await executeChunkedQuery(
 *   achievementIds,
 *   async (chunkIds) => {
 *     return await supabase
 *       .from("xp_transactions")
 *       .select("source_id")
 *       .eq("source_type", "MISSION_COMPLETION")
 *       .in("source_id", chunkIds);
 *   }
 * );
 */
export async function executeChunkedQuery<T>(
  ids: string[],
  queryFn: (
    chunkIds: string[],
  ) => Promise<{ data: T[] | null; error: PostgrestError | null }>,
  chunkSize = 50,
): Promise<{ data: T[] | null; error: Error | null }> {
  if (ids.length === 0) {
    return { data: [], error: null };
  }

  const chunks = chunkArray(ids, chunkSize);
  const allResults: T[] = [];

  console.log(
    `${ids.length}件のIDを${chunks.length}個のチャンク（各${chunkSize}件）に分割して処理します`,
  );

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const { data, error } = await queryFn(chunk);

    if (error) {
      console.error(
        `チャンク ${i + 1}/${chunks.length} でエラー発生: ${error.message}`,
      );
      return { data: null, error: new Error(error.message) };
    }

    if (data) {
      allResults.push(...data);
    }

    if (chunks.length > 10 && (i + 1) % 10 === 0) {
      console.log(`進捗: ${i + 1}/${chunks.length} チャンク完了`);
    }
  }

  console.log(
    `全${chunks.length}チャンクの処理が完了しました。合計${allResults.length}件の結果を取得`,
  );

  return { data: allResults, error: null };
}

/**
 * 大量のレコードの挿入をチャンク分割して実行する
 * リクエストサイズ制限を回避するためのヘルパー関数
 *
 * @example
 * const { data, error } = await executeChunkedInsert(
 *   records,
 *   async (chunk) => {
 *     return await supabase
 *       .from("xp_transactions")
 *       .insert(chunk);
 *   }
 * );
 */
export async function executeChunkedInsert<T, R>(
  records: R[],
  insertFn: (
    chunkRecords: R[],
  ) => Promise<{ data: T[] | null; error: PostgrestError | null }>,
  chunkSize = 50,
): Promise<{ data: T[] | null; error: Error | null }> {
  if (records.length === 0) {
    return { data: [], error: null };
  }

  const chunks = chunkArray(records, chunkSize);
  const allResults: T[] = [];

  console.log(
    `${records.length}件のレコードを${chunks.length}個のチャンク（各${chunkSize}件）に分割して挿入します`,
  );

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const { data, error } = await insertFn(chunk);

    if (error) {
      console.error(
        `チャンク ${i + 1}/${chunks.length} の挿入でエラー発生: ${error.message}`,
      );
      return { data: null, error: new Error(error.message) };
    }

    if (data) {
      allResults.push(...data);
    }

    if (chunks.length > 10 && (i + 1) % 10 === 0) {
      console.log(`進捗: ${i + 1}/${chunks.length} チャンク挿入完了`);
    }
  }

  console.log(`全${chunks.length}チャンクの挿入が完了しました`);

  return { data: allResults.length > 0 ? allResults : null, error: null };
}
