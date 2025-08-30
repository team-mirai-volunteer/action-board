/**
 * メトリクス関連の型定義
 */

/**
 * サポーター数データの型定義
 * 外部APIから取得するサポーター情報の構造を定義
 */
export interface SupporterData {
  totalCount: number; // 総サポーター数
  last24hCount: number; // 過去24時間の新規サポーター数
  updatedAt: string; // データ更新日時（ISO形式）
}

/**
 * 寄付金データの型定義
 * 外部APIから取得する寄付金情報の構造を定義
 */
export interface DonationData {
  totalAmount: number; // 総寄付金額（円単位）
  last24hAmount: number; // 過去24時間の寄付金額（円単位）
  updatedAt: string; // データ更新日時（ISO形式）
}

/**
 * アクション達成データの型定義
 * Supabaseから取得するアクション情報の構造を定義
 */
export interface AchievementData {
  totalCount: number; // 総アクション達成数
  todayCount: number; // 本日のアクション達成数
}

/**
 * ユーザー登録データの型定義
 * Supabaseから取得するユーザー登録情報の構造を定義
 */
export interface RegistrationData {
  totalCount: number; // 総ユーザー登録数
  todayCount: number; // 本日のユーザー登録数
}

/**
 * 統合メトリクスデータの型定義
 * 全てのメトリクス情報を統合した構造を定義
 */
export interface MetricsData {
  supporter: SupporterData | null;
  donation: DonationData | null;
  achievement: AchievementData | null;
  registration: RegistrationData | null;
}
