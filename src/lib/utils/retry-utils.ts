/**
 * リトライユーティリティ
 * 一時的な障害（ネットワーク断・レートリミット・APIサーバー内部エラー等）で失敗した
 * 非同期処理を指数バックオフ付きで再試行する
 */

/** リトライ対象とする一時的な HTTP ステータスコード */
export const TRANSIENT_HTTP_STATUSES: ReadonlySet<number> = new Set([
  408, // Request Timeout
  429, // Too Many Requests
  500, // Internal Server Error（YouTube API の backendError 等）
  502, // Bad Gateway
  503, // Service Unavailable
  504, // Gateway Timeout
]);

/**
 * レスポンスが得られないネットワークレベルの一時的エラーのパターン
 * （エラーメッセージ・エラーコードに対して照合する）
 */
const TRANSIENT_ERROR_PATTERNS: readonly RegExp[] = [
  /premature close/i, // レスポンスストリームの途中切断
  /socket hang up/i,
  /fetch failed/i, // Node.js ネイティブ fetch のネットワークエラー
  /ECONNRESET/,
  /ECONNREFUSED/,
  /ECONNABORTED/,
  /ETIMEDOUT/,
  /EAI_AGAIN/, // DNS の一時的な失敗
  /ENETUNREACH/,
  /EPIPE/,
  /timeout/i, // gaxios の "timeout of 30000ms exceeded" 等
];

export interface RetryOptions {
  /** 最大試行回数（初回を含む）。デフォルト 3 */
  maxAttempts?: number;
  /** 初回リトライまでの待機時間（ミリ秒）。デフォルト 1000 */
  initialDelayMs?: number;
  /** リトライごとの待機時間の倍率。デフォルト 2 */
  backoffMultiplier?: number;
  /** リトライ対象かどうかの判定。デフォルトは isTransientError */
  shouldRetry?: (error: unknown) => boolean;
  /** リトライ直前に呼ばれるフック（ログ出力用） */
  onRetry?: (error: unknown, attempt: number, delayMs: number) => void;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** エラーから HTTP ステータスコードを取り出す（GaxiosError 等の response.status / status に対応） */
function extractHttpStatus(error: object): number | undefined {
  const candidate = error as {
    response?: { status?: unknown };
    status?: unknown;
  };
  if (typeof candidate.response?.status === "number") {
    return candidate.response.status;
  }
  if (typeof candidate.status === "number") {
    return candidate.status;
  }
  return undefined;
}

/**
 * リトライで解消しうる一時的なエラーかどうかを判定する
 * - HTTP ステータスが取れる場合: 408/429/5xx のみ一時的とみなす
 * - ステータスが無い場合: ネットワークレベルのエラーパターンに一致するか、
 *   ラップされた内側のエラー（cause / error）が一時的なら一時的とみなす
 */
export function isTransientError(error: unknown, depth = 0): boolean {
  if (depth > 3 || typeof error !== "object" || error === null) {
    return false;
  }

  // AbortSignal.timeout 等によるタイムアウトは一時的エラーとして扱う
  if ((error as { name?: unknown }).name === "TimeoutError") {
    return true;
  }

  const status = extractHttpStatus(error);
  if (status !== undefined) {
    return TRANSIENT_HTTP_STATUSES.has(status);
  }

  const {
    code,
    message,
    cause,
    error: wrappedError,
  } = error as {
    code?: unknown;
    message?: unknown;
    cause?: unknown;
    error?: unknown;
  };
  const text = `${typeof code === "string" ? code : ""} ${typeof message === "string" ? message : ""}`;
  if (TRANSIENT_ERROR_PATTERNS.some((pattern) => pattern.test(text))) {
    return true;
  }

  return (
    isTransientError(cause, depth + 1) ||
    isTransientError(wrappedError, depth + 1)
  );
}

/**
 * 非同期処理を指数バックオフ付きで再試行する
 * shouldRetry が false を返すエラー、および最終試行のエラーはそのまま throw する
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelayMs = 1000,
    backoffMultiplier = 2,
    shouldRetry = isTransientError,
    onRetry,
  } = options;

  let delayMs = initialDelayMs;
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= maxAttempts || !shouldRetry(error)) {
        throw error;
      }
      onRetry?.(error, attempt, delayMs);
      await sleep(delayMs);
      delayMs *= backoffMultiplier;
    }
  }
}

/** fetchWithRetry のオプション（リトライ条件は一時的エラー固定のため shouldRetry は受け取らない） */
export interface FetchRetryOptions extends Omit<RetryOptions, "shouldRetry"> {
  /** リトライログに出す呼び出し元ラベル。URL は API キーを含みうるためログに出さない */
  label?: string;
  /** 1回の fetch 試行あたりのタイムアウト（ミリ秒）。デフォルト 30000。init.signal 指定時は無効 */
  timeoutMs?: number;
}

/**
 * fetch を一時的な障害に対する再試行付きで実行する
 * - ネットワークエラー: 一時的なら再試行し、最終試行のエラーはそのまま throw
 * - 一時的な HTTP ステータス（408/429/5xx）: 再試行し、最終試行のレスポンスはそのまま返す
 *   （呼び出し側の response.ok 判定・エラーハンドリングを変えないため）
 */
export async function fetchWithRetry(
  input: string | URL,
  init?: RequestInit,
  options: FetchRetryOptions = {},
): Promise<Response> {
  const {
    maxAttempts = 3,
    initialDelayMs = 1000,
    backoffMultiplier = 2,
    label = "Fetch",
    timeoutMs = 30_000,
    onRetry = (error, attempt, delayMs) =>
      console.warn(
        `${label} failed (attempt ${attempt}), retrying in ${delayMs}ms:`,
        error instanceof Error ? error.message : error,
      ),
  } = options;

  let delayMs = initialDelayMs;
  for (let attempt = 1; ; attempt++) {
    let retryReason: unknown;
    // 呼び出し側が signal を渡していない場合のみ、試行ごとにタイムアウト用の AbortController を用意する
    const controller = init?.signal ? undefined : new AbortController();
    const timer = controller
      ? setTimeout(() => controller.abort(), timeoutMs)
      : undefined;
    try {
      const response = await fetch(
        input,
        controller ? { ...init, signal: controller.signal } : init,
      );
      if (
        !TRANSIENT_HTTP_STATUSES.has(response.status) ||
        attempt >= maxAttempts
      ) {
        return response;
      }
      // 再試行前に、捨てるレスポンスのボディを解放する
      try {
        await response.body?.cancel();
      } catch {
        // ボディ解放の失敗は無視してよい
      }
      retryReason = new Error(`HTTP ${response.status}`);
    } catch (error) {
      const timedOut = controller?.signal.aborted === true;
      const reason = timedOut
        ? new Error(`Fetch aborted after ${timeoutMs}ms timeout`)
        : error;
      if (attempt >= maxAttempts || !(timedOut || isTransientError(error))) {
        throw reason;
      }
      retryReason = reason;
    } finally {
      if (timer !== undefined) {
        clearTimeout(timer);
      }
    }
    onRetry(retryReason, attempt, delayMs);
    await sleep(delayMs);
    delayMs *= backoffMultiplier;
  }
}
