/**
 * メトリクス表示コンポーネント（リファクタリング済み）
 *
 * 元の426行のファイルを機能別レイヤーに分割してリファクタリング：
 * - lib/types/metrics.ts: 型定義
 * - lib/services/metrics.ts: データ取得ロジック
 * - lib/utils/metrics-formatter.ts: フォーマット関数
 * - components/metrics/: モジュラーUIコンポーネント群
 */
export { default } from "./metrics/index";
