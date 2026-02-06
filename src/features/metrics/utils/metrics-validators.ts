import type {
  DonationData,
  SupporterData,
} from "@/features/metrics/types/metrics-types";

/**
 * サポーター数データの型ガード関数
 * 外部APIから取得したデータが期待する形式かどうかを検証
 * @param data - 検証対象のデータ
 * @returns データが正しい形式の場合true、そうでなければfalse
 */
export function validateSupporterData(data: unknown): data is SupporterData {
  if (typeof data !== "object" || data === null) return false;

  const record = data as Record<string, unknown>;
  return (
    "totalCount" in record &&
    "last24hCount" in record &&
    "updatedAt" in record &&
    typeof record.totalCount === "number" &&
    typeof record.last24hCount === "number" &&
    typeof record.updatedAt === "string" &&
    record.totalCount >= 0 && // 負の値は無効
    record.last24hCount >= 0 && // 負の値は無効
    !Number.isNaN(Date.parse(record.updatedAt)) // 有効な日付形式かチェック
  );
}

/**
 * 寄付金データの型ガード関数
 * 外部APIから取得したデータが期待する形式かどうかを検証
 * @param data - 検証対象のデータ
 * @returns データが正しい形式の場合true、そうでなければfalse
 */
export function validateDonationData(data: unknown): data is DonationData {
  if (typeof data !== "object" || data === null) return false;

  const record = data as Record<string, unknown>;
  return (
    "totalAmount" in record &&
    "last24hAmount" in record &&
    "updatedAt" in record &&
    typeof record.totalAmount === "number" &&
    typeof record.last24hAmount === "number" &&
    typeof record.updatedAt === "string" &&
    record.totalAmount >= 0 && // 負の値は無効
    record.last24hAmount >= 0 && // 負の値は無効
    !Number.isNaN(Date.parse(record.updatedAt)) // 有効な日付形式かチェック
  );
}
