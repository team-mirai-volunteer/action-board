// 会場コード（キャラバン等の会場別アトリビューション計測用）の形式
// 例: sapporo-0730。英数字・ハイフン・アンダースコアの1〜50文字
const VENUE_CODE_REGEX = /^[a-zA-Z0-9_-]{1,50}$/;

export function isValidVenueCodeFormat(venueCode: string): boolean {
  return VENUE_CODE_REGEX.test(venueCode);
}
