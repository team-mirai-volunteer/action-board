/**
 * ポスター掲示板のステータス履歴にユーザー情報を紐付ける純粋関数
 */

interface UserProfile {
  id: string;
  name: string | null;
  address_prefecture: string | null;
}

interface StatusHistoryRecord {
  user_id: string;
  [key: string]: unknown;
}

/**
 * ステータス履歴レコードの配列にユーザープロフィール情報を付加する。
 * userMapにユーザーが存在しない場合はuser: nullとなる。
 */
export function mapUserToHistory<T extends StatusHistoryRecord>(
  historyData: T[],
  userMap: Map<string, UserProfile>,
): (T & { user: UserProfile | null })[] {
  return historyData.map((h) => ({
    ...h,
    user: userMap.get(h.user_id) || null,
  }));
}
