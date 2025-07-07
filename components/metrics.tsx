import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import { TooltipButton } from "./tooltip-button";

/**
 * サポーター数データの型定義
 * 外部APIから取得するサポーター情報の構造を定義
 */
interface SupporterData {
  totalCount: number; // 総サポーター数
  last24hCount: number; // 過去24時間の新規サポーター数
  updatedAt: string; // データ更新日時（ISO形式）
}

/**
 * 寄付金データの型定義
 * 外部APIから取得する寄付金情報の構造を定義
 */
interface DonationData {
  totalAmount: number; // 総寄付金額（円単位）
  last24hAmount: number; // 過去24時間の寄付金額（円単位）
  updatedAt: string; // データ更新日時（ISO形式）
}

/**
 * サポーター数データの型ガード関数
 * 外部APIから取得したデータが期待する形式かどうかを検証
 * @param data - 検証対象のデータ
 * @returns データが正しい形式の場合true、そうでなければfalse
 */
function validateSupporterData(data: unknown): data is SupporterData {
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
function validateDonationData(data: unknown): data is DonationData {
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
 * 更新日時を日本語形式でフォーマット
 * @param timestamp - ISO形式の日時文字列
 * @returns 日本語ロケールでフォーマットされた日時文字列（例: "2025/07/03 14:30"）
 */
const formatUpdateTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * チームみらいサポーター数データを外部APIから取得
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
async function fetchSupporterData(): Promise<SupporterData | null> {
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
 * チームみらい寄付金データを外部APIから取得
 *
 * この関数は以下の処理を行います：
 * 1. GitHub Gistに保存されたStripe寄付金データを取得
 * 2. 10秒のタイムアウト設定でリクエストの無限待機を防止
 * 3. レスポンスの妥当性を検証（ステータスコード、Content-Type）
 * 4. データ形式の検証（型ガード関数を使用）
 * 5. エラー時は適切にログ出力してnullを返却
 *
 * 寄付金データには以下が含まれます：
 * - 政治団体「チームみらい」への寄付
 * - 安野たかひろ及び各公認候補予定者の政治団体への寄付
 *
 * @returns Promise<DonationData | null> - 成功時は寄付金データ、失敗時はnull
 */
async function fetchDonationData(): Promise<DonationData | null> {
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
 * メトリクス表示コンポーネント
 *
 * チームみらいの活動状況を表示するメインコンポーネント
 * 以下のデータを統合して表示：
 * 1. サポーター数（外部API）
 * 2. 寄付金額（外部API）
 * 3. アクション達成数（Supabase）
 * 4. ユーザー登録数（Supabase）
 */
export default async function Metrics() {
  const supabase = await createClient();

  const [supporterData, donationData] = await Promise.all([
    fetchSupporterData(), // サポーター数データ
    fetchDonationData(), // 寄付金データ
  ]);

  const supporterCount =
    supporterData?.totalCount ??
    (Number(process.env.FALLBACK_SUPPORTER_COUNT) || 0);

  const supporterIncrease =
    supporterData?.last24hCount ??
    (Number(process.env.FALLBACK_SUPPORTER_INCREASE) || 0);

  const donationAmount = donationData
    ? donationData.totalAmount / 10000 // 円を万円に変換
    : Number(process.env.FALLBACK_DONATION_AMOUNT)
      ? Number(process.env.FALLBACK_DONATION_AMOUNT) / 10000
      : 0;

  const donationIncrease = donationData
    ? donationData.last24hAmount / 10000 // 円を万円に変換
    : Number(process.env.FALLBACK_DONATION_INCREASE)
      ? Number(process.env.FALLBACK_DONATION_INCREASE) / 10000
      : 0;

  /**
   * 金額を日本語形式でフォーマット（万円・億円単位）
   *
   * 例：
   * - 1234万円 → "1234万円"
   * - 12345万円 → "1億2345万円"
   * - 10000万円 → "1億円"
   * - 1234.5万円 → "1234.5万円"
   * - 1234.0万円 → "1234万円"（小数点以下0は省略）
   *
   * @param amount - 万円単位の金額
   * @returns フォーマットされた金額文字列
   */
  const formatAmount = (amount: number) => {
    const oku = Math.floor(amount / 10000); // 億の部分
    const man = amount % 10000; // 万の部分

    if (oku === 0) {
      const formatted = man.toFixed(1);
      const display = formatted.endsWith(".0")
        ? formatted.slice(0, -2) // 小数点以下0は省略
        : formatted;
      return `${display}万円`;
    }

    if (man === 0) {
      return `${oku}億円`;
    }

    const manFormatted = man.toFixed(1);
    const manDisplay = manFormatted.endsWith(".0")
      ? manFormatted.slice(0, -2) // 小数点以下0は省略
      : manFormatted;
    return `${oku}億${manDisplay}万円`;
  };

  const { count: achievementCount } = await supabase
    .from("achievements")
    .select("*", { count: "exact", head: true });

  const date = new Date();
  date.setHours(date.getHours() - 24);

  const { count: todayAchievementCount } = await supabase
    .from("achievements")
    .select("*", { count: "exact", head: true })
    .gte("created_at", date.toISOString());

  const { count: totalRegistrationCount } = await supabase
    .from("public_user_profiles")
    .select("*", { count: "exact", head: true });

  const { count: todayRegistrationCount } = await supabase
    .from("public_user_profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", date.toISOString());

  return (
    <section className="bg-gradient-hero flex justify-center py-6 px-4">
      <div className="w-full max-w-xl bg-white rounded-md shadow-custom p-6">
        {/* ヘッダー部分：タイトルと最終更新日時 */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-black mb-1">
            チームみらいの活動状況🚀
          </h2>
          <p className="text-xs text-black">
            {/* 外部APIから取得した更新日時、失敗時は環境変数のフォールバック値を表示 */}
            {supporterData?.updatedAt
              ? formatUpdateTime(supporterData.updatedAt)
              : process.env.FALLBACK_UPDATE_DATE || "2025.07.03 02:20"}{" "}
            更新
          </p>
        </div>

        {/* サポーター数表示エリア（メインハイライト） */}
        <div className="mb-6">
          <div
            className="p-4 text-center"
            style={{ backgroundColor: "#F9F9F9" }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <p className="text-xs font-bold text-black">
                チームみらい　サポーター数
              </p>
            </div>
            {/* 総サポーター数（大きく表示） */}
            <p className="text-3xl font-bold text-teal-700 mb-1">
              {supporterCount.toLocaleString()}
              <span className="text-xl">人</span>
            </p>
            {/* 24時間の増加数 */}
            <p className="text-sm text-black">
              1日で{" "}
              <span className="font-bold text-teal-700">
                +{supporterIncrease.toLocaleString()}
                <span className="text-xs">人増えました！</span>
              </span>
            </p>
          </div>
        </div>

        {/* 下段：アクション数と寄付金額を左右に分割表示 */}
        <div className="flex items-stretch">
          {/* 左側：アクション達成数 */}
          <div className="flex-1 text-center flex flex-col justify-center">
            <p className="text-xs font-bold text-black mb-2">
              達成したアクション数
            </p>
            {/* 総アクション数（Supabaseから取得、失敗時は環境変数フォールバック） */}
            <p className="text-2xl font-black text-black mb-1">
              {achievementCount?.toLocaleString() ||
                (
                  Number(process.env.FALLBACK_ACHIEVEMENT_COUNT) || 0
                ).toLocaleString()}
              <span className="text-lg">件</span>
            </p>
            {/* 24時間のアクション増加数 */}
            <p className="text-xs text-black">
              1日で{" "}
              <span className="font-bold text-teal-700">
                +
                {todayAchievementCount?.toLocaleString() ||
                  (
                    Number(process.env.FALLBACK_TODAY_ACHIEVEMENT_COUNT) || 0
                  ).toLocaleString()}
                <span className="text-xs">件</span>
              </span>
            </p>
          </div>

          {/* 中央：縦線セパレーター */}
          <Separator orientation="vertical" className="mx-4 h-full" />

          {/* 右側：寄付金額 */}
          <div className="flex-1 text-center flex flex-col justify-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <p className="text-xs font-bold text-black">現在の寄付金額</p>
              {/* 寄付金額の詳細説明ツールチップ */}
              <TooltipButton
                ariaLabel="寄付金額の詳細情報"
                tooltipId="donation-tooltip"
                tooltip={
                  <>
                    政治団体「チームみらい」への寄付と、
                    <br />
                    安野及び各公認候補予定者の政治団体への寄付の合計金額
                  </>
                }
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <title>寄付金額の詳細情報</title>
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </TooltipButton>
            </div>
            {/* 総寄付金額（外部APIから取得、失敗時は環境変数フォールバック） */}
            <p className="text-2xl font-black text-black mb-1">
              {formatAmount(donationAmount)}
            </p>
            {/* 24時間の寄付金増加額 */}
            <p className="text-xs text-black">
              1日で{" "}
              <span className="font-bold text-teal-700">
                +{formatAmount(donationIncrease)}
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
