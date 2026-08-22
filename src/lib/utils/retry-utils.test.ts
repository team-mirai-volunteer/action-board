import { fetchWithRetry, isTransientError, withRetry } from "./retry-utils";

// テストを高速化するため待機時間は最小にする
const fastRetry = { initialDelayMs: 1, backoffMultiplier: 1 };

describe("isTransientError", () => {
  it("408/429/5xx の HTTP ステータスを一時的エラーと判定する", () => {
    for (const status of [408, 429, 500, 502, 503, 504]) {
      expect(isTransientError({ response: { status } })).toBe(true);
    }
  });

  it("4xx（400/401/403/404）は一時的エラーと判定しない", () => {
    for (const status of [400, 401, 403, 404]) {
      expect(isTransientError({ response: { status } })).toBe(false);
    }
  });

  it("トップレベルの status プロパティも参照する", () => {
    expect(isTransientError({ status: 503 })).toBe(true);
    expect(isTransientError({ status: 404 })).toBe(false);
  });

  it("TimeoutError / timeout メッセージを一時的エラーと判定する", () => {
    const timeoutError = new Error("The operation was aborted");
    timeoutError.name = "TimeoutError";
    expect(isTransientError(timeoutError)).toBe(true);
    expect(isTransientError(new Error("timeout of 30000ms exceeded"))).toBe(
      true,
    );
  });

  it("ネットワークレベルのエラーメッセージを一時的エラーと判定する", () => {
    expect(
      isTransientError(
        new Error(
          "Invalid response body while trying to fetch https://example.com: Premature close",
        ),
      ),
    ).toBe(true);
    expect(isTransientError(new Error("socket hang up"))).toBe(true);
    expect(isTransientError(new TypeError("fetch failed"))).toBe(true);
  });

  it("エラーコード（ECONNRESET 等）を一時的エラーと判定する", () => {
    const error = new Error("read error") as Error & { code: string };
    error.code = "ECONNRESET";
    expect(isTransientError(error)).toBe(true);
  });

  it("cause にラップされた一時的エラーを検出する", () => {
    const cause = new Error("connect ETIMEDOUT 203.0.113.1:443");
    expect(isTransientError(new Error("request failed", { cause }))).toBe(true);
  });

  it("一般的なエラー・非オブジェクトは一時的エラーと判定しない", () => {
    expect(isTransientError(new Error("something went wrong"))).toBe(false);
    expect(isTransientError(new TypeError("x is not a function"))).toBe(false);
    expect(isTransientError(undefined)).toBe(false);
    expect(isTransientError("error string")).toBe(false);
  });
});

describe("withRetry", () => {
  it("成功した場合はリトライせず結果を返す", async () => {
    const fn = jest.fn().mockResolvedValue("ok");
    await expect(withRetry(fn, fastRetry)).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("一時的エラーの場合は成功するまでリトライする", async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error("socket hang up"))
      .mockRejectedValueOnce(new Error("socket hang up"))
      .mockResolvedValue("ok");
    await expect(withRetry(fn, fastRetry)).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("一時的でないエラーは即座に throw する", async () => {
    const fn = jest.fn().mockRejectedValue(new Error("bad request"));
    await expect(withRetry(fn, fastRetry)).rejects.toThrow("bad request");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("最大試行回数に達したら最後のエラーを throw する", async () => {
    const fn = jest.fn().mockRejectedValue(new Error("socket hang up"));
    await expect(
      withRetry(fn, { ...fastRetry, maxAttempts: 3 }),
    ).rejects.toThrow("socket hang up");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("リトライごとに onRetry が呼ばれる", async () => {
    const onRetry = jest.fn();
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error("socket hang up"))
      .mockResolvedValue("ok");
    await withRetry(fn, { ...fastRetry, onRetry });
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(expect.any(Error), 1, 1);
  });

  it("shouldRetry でリトライ条件を上書きできる", async () => {
    const fn = jest.fn().mockRejectedValue(new Error("custom"));
    await expect(
      withRetry(fn, { ...fastRetry, shouldRetry: () => true, maxAttempts: 2 }),
    ).rejects.toThrow("custom");
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe("fetchWithRetry", () => {
  let fetchMock: jest.Mock;
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  function makeResponse(status: number): Response {
    return { status, ok: status >= 200 && status < 300 } as Response;
  }

  it("成功レスポンスはそのまま返す", async () => {
    fetchMock.mockResolvedValue(makeResponse(200));
    const response = await fetchWithRetry(
      "https://example.com",
      undefined,
      fastRetry,
    );
    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("一時的な HTTP ステータスはリトライして成功レスポンスを返す", async () => {
    fetchMock
      .mockResolvedValueOnce(makeResponse(500))
      .mockResolvedValue(makeResponse(200));
    const response = await fetchWithRetry(
      "https://example.com",
      undefined,
      fastRetry,
    );
    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("一時的でない HTTP ステータス（404 等）はリトライせず返す", async () => {
    fetchMock.mockResolvedValue(makeResponse(404));
    const response = await fetchWithRetry(
      "https://example.com",
      undefined,
      fastRetry,
    );
    expect(response.status).toBe(404);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("最大試行回数に達したら最後のレスポンスをそのまま返す", async () => {
    fetchMock.mockResolvedValue(makeResponse(503));
    const response = await fetchWithRetry("https://example.com", undefined, {
      ...fastRetry,
      maxAttempts: 3,
    });
    expect(response.status).toBe(503);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("一時的なネットワークエラーはリトライし、成功したらレスポンスを返す", async () => {
    fetchMock
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValue(makeResponse(200));
    const response = await fetchWithRetry(
      "https://example.com",
      undefined,
      fastRetry,
    );
    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("一時的でないエラーは即座に throw する", async () => {
    fetchMock.mockRejectedValue(new TypeError("Invalid URL"));
    await expect(
      fetchWithRetry("https://example.com", undefined, fastRetry),
    ).rejects.toThrow("Invalid URL");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("label がデフォルトのリトライログに使われる", async () => {
    fetchMock
      .mockResolvedValueOnce(makeResponse(500))
      .mockResolvedValue(makeResponse(200));
    await fetchWithRetry("https://example.com", undefined, {
      ...fastRetry,
      label: "MyAPI fetch",
    });
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("MyAPI fetch failed (attempt 1)"),
      expect.anything(),
    );
  });

  it("タイムアウトした試行は中断され、リトライされる", async () => {
    fetchMock
      .mockImplementationOnce(
        (_input: unknown, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener("abort", () =>
              reject(new Error("The operation was aborted")),
            );
          }),
      )
      .mockResolvedValue(makeResponse(200));
    const response = await fetchWithRetry("https://example.com", undefined, {
      ...fastRetry,
      timeoutMs: 20,
    });
    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("リトライ時に onRetry が呼ばれる", async () => {
    const onRetry = jest.fn();
    fetchMock
      .mockResolvedValueOnce(makeResponse(500))
      .mockResolvedValue(makeResponse(200));
    await fetchWithRetry("https://example.com", undefined, {
      ...fastRetry,
      onRetry,
    });
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(expect.any(Error), 1, 1);
  });
});
