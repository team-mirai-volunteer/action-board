import { base64UrlEncode } from "./auth-helpers";

describe("base64UrlEncode", () => {
  it("Uint8ArrayをBase64 URLセーフ文字列にエンコードする", () => {
    const input = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
    const result = base64UrlEncode(input);

    expect(result).toBe("SGVsbG8");
    // URL-safe: +, /, = は含まれない
    expect(result).not.toContain("+");
    expect(result).not.toContain("/");
    expect(result).not.toContain("=");
  });

  it("空のUint8Arrayを処理できる", () => {
    const input = new Uint8Array([]);
    const result = base64UrlEncode(input);
    expect(result).toBe("");
  });

  it("+を-に、/を_に置換する", () => {
    // Base64で+や/が出るバイト列を使用
    // 0xFB, 0xEF, 0xBE -> base64: "+++" -> URL-safe: "---"
    const input = new Uint8Array([0xfb, 0xef, 0xbe]);
    const result = base64UrlEncode(input);

    expect(result).not.toContain("+");
    expect(result).not.toContain("/");
  });

  it("末尾のパディング(=)を除去する", () => {
    // 1バイトの場合、通常のBase64では==パディングが付く
    const input = new Uint8Array([65]); // "A" -> base64: "QQ=="
    const result = base64UrlEncode(input);

    expect(result).not.toContain("=");
    expect(result).toBe("QQ");
  });

  it("32バイトのランダムデータを正しくエンコードできる（PKCE verifier相当）", () => {
    const input = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      input[i] = i;
    }

    const result = base64UrlEncode(input);

    // 結果がURL-safe Base64の文字のみを含むこと
    expect(result).toMatch(/^[A-Za-z0-9_-]+$/);
    // 32バイト -> 約43文字のBase64（パディングなし）
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThanOrEqual(44);
  });
});
