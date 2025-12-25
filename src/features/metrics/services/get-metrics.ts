import "server-only";

import type {
  AchievementData,
  DonationData,
  MetricsData,
  RegistrationData,
  SupporterData,
} from "@/features/metrics/types/metrics-types";
import { createClient } from "@/lib/supabase/client";

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

/**
 * チームはやまサポーター数データを外部APIから取得
 *
 * この関数は以下の処理を行います：
 * 1. GitHub Gistに保存されたサポーター数データを取得
 * 2. 10秒のタイムアウト設定でリクエストの無限待機を防止
 * 3. レスポンスの妥当性を検証（ステータスコード、Content-Type）
 * 4. データ形式の検証（型ガード関数を使用）
 * 5. エラー時は適切にログ出力してnullを返却
 *
 * @returns Promise<SupporterData | null> - 成功時はサポーター数データ、失敗時はnull
 */
export async function fetchSupporterData(): Promise<SupporterData | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒でタイムアウト

    const response = await fetch(
      "https://gist.github.com/nishio/1cba2c9707f6eb06d683fbe21dbbc5ae/raw/latest_supporter_data.json",
      {
        signal: controller.signal, // タイムアウト制御
        next: { revalidate: 3600 }, // Next.js: 1時間キャッシュ
        headers: {
          Accept: "application/json",
          "User-Agent": "Action-Board/1.0", // API呼び出し元の識別
        },
      },
    );

    clearTimeout(timeoutId); // 成功時はタイムアウトをクリア

    if (!response.ok) {
      console.error(
        `サポーター数API エラー: ${response.status} ${response.statusText}`,
      );
      return null;
    }

    const contentType = response.headers.get("content-type");
    if (
      !contentType?.includes("application/json") &&
      !contentType?.includes("text/plain")
    ) {
      console.error("サポーター数API 無効なContent-Type:", contentType);
      return null;
    }

    const data = await response.json();
    return validateSupporterData(data) ? data : null;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("サポーター数API タイムアウト");
    } else {
      console.error("サポーター数API 取得エラー:", error);
    }
    return null;
  }
}

/**
 * チームはやま寄付金データを外部APIから取得
 *
 * この関数は以下の処理を行います：
 * 1. GitHub Gistに保存されたStripe寄付金データを取得
 * 2. 10秒のタイムアウト設定でリクエストの無限待機を防止
 * 3. レスポンスの妥当性を検証（ステータスコード、Content-Type）
 * 4. データ形式の検証（型ガード関数を使用）
 * 5. エラー時は適切にログ出力してnullを返却
 *
 * 寄付金データには以下が含まれます：
 * - 政治団体「チームはやま」への寄付
 * - 安野たかひろ及び各公認候補予定者の政治団体への寄付
 *
 * @returns Promise<DonationData | null> - 成功時は寄付金データ、失敗時はnull
 */
export async function fetchDonationData(): Promise<DonationData | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒でタイムアウト

    const response = await fetch(
      "https://gist.githubusercontent.com/nishio/f45275a47e42bbb76f7efef750bed37a/raw/latest_stripe_data.json",
      {
        signal: controller.signal, // タイムアウト制御
        next: { revalidate: 3600 }, // Next.js: 1時間キャッシュ
        headers: {
          Accept: "application/json",
          "User-Agent": "Action-Board/1.0", // API呼び出し元の識別
        },
      },
    );

    clearTimeout(timeoutId); // 成功時はタイムアウトをクリア

    if (!response.ok) {
      console.error(
        `寄付金API エラー: ${response.status} ${response.statusText}`,
      );
      return null;
    }

    const contentType = response.headers.get("content-type");
    if (
      !contentType?.includes("application/json") &&
      !contentType?.includes("text/plain")
    ) {
      console.error("寄付金API 無効なContent-Type:", contentType);
      return null;
    }

    const data = await response.json();
    return validateDonationData(data) ? data : null;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("寄付金API タイムアウト");
    } else {
      console.error("寄付金API 取得エラー:", error);
    }
    return null;
  }
}

/**
 * アクション達成数データをSupabaseから取得
 *
 * @returns Promise<AchievementData> - アクション達成数データ
 */
export async function fetchAchievementData(): Promise<AchievementData> {
  const supabase = createClient();

  const { count: totalCount } = await supabase
    .from("achievements")
    .select("*", { count: "exact", head: true });

  const date = new Date();
  date.setHours(date.getHours() - 24);

  const { count: todayCount } = await supabase
    .from("achievements")
    .select("*", { count: "exact", head: true })
    .gte("created_at", date.toISOString());

  return {
    totalCount: totalCount || 0,
    todayCount: todayCount || 0,
  };
}

/**
 * ユーザー登録数データをSupabaseから取得
 *
 * @returns Promise<RegistrationData> - ユーザー登録数データ
 */
export async function fetchRegistrationData(): Promise<RegistrationData> {
  const supabase = createClient();

  const { count: totalCount } = await supabase
    .from("public_user_profiles")
    .select("*", { count: "exact", head: true });

  const date = new Date();
  date.setHours(date.getHours() - 24);

  const { count: todayCount } = await supabase
    .from("public_user_profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", date.toISOString());

  return {
    totalCount: totalCount || 0,
    todayCount: todayCount || 0,
  };
}

/**
 * 全てのメトリクスデータを統合して取得
 *
 * @returns Promise<MetricsData> - 統合されたメトリクスデータ
 */
export async function fetchAllMetricsData(): Promise<MetricsData> {
  const [supporterData, donationData, achievementData, registrationData] =
    await Promise.all([
      fetchSupporterData(),
      fetchDonationData(),
      fetchAchievementData(),
      fetchRegistrationData(),
    ]);

  return {
    supporter: supporterData,
    donation: donationData,
    achievement: achievementData,
    registration: registrationData,
  };
}
