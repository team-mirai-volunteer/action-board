import {
  extractAvatarPathFromUrl,
  shouldDeleteOldAvatar,
  validateAvatarFile,
} from "./avatar-helpers";

describe("validateAvatarFile", () => {
  it("null の場合は valid を返す", () => {
    expect(validateAvatarFile(null)).toEqual({ valid: true });
  });

  it("size が 0 の場合は valid を返す", () => {
    expect(validateAvatarFile({ size: 0, type: "image/png" })).toEqual({
      valid: true,
    });
  });

  it("5MB 以下の JPEG は valid", () => {
    expect(
      validateAvatarFile({ size: 1024 * 1024, type: "image/jpeg" }),
    ).toEqual({ valid: true });
  });

  it("5MB 以下の JPG は valid", () => {
    expect(
      validateAvatarFile({ size: 1024 * 1024, type: "image/jpg" }),
    ).toEqual({ valid: true });
  });

  it("5MB 以下の PNG は valid", () => {
    expect(validateAvatarFile({ size: 1024, type: "image/png" })).toEqual({
      valid: true,
    });
  });

  it("5MB 以下の WebP は valid", () => {
    expect(validateAvatarFile({ size: 1024, type: "image/webp" })).toEqual({
      valid: true,
    });
  });

  it("5MB 超のファイルはエラーを返す", () => {
    const result = validateAvatarFile({
      size: 5 * 1024 * 1024 + 1,
      type: "image/png",
    });
    expect(result.valid).toBe(false);
    expect(result.error).toBe("画像ファイルのサイズは5MB以下にしてください");
  });

  it("不正な MIME タイプはエラーを返す (image/gif)", () => {
    const result = validateAvatarFile({ size: 1024, type: "image/gif" });
    expect(result.valid).toBe(false);
    expect(result.error).toBe("対応している画像形式はJPEG、PNG、WebPです");
  });

  it("不正な MIME タイプはエラーを返す (application/pdf)", () => {
    const result = validateAvatarFile({
      size: 1024,
      type: "application/pdf",
    });
    expect(result.valid).toBe(false);
    expect(result.error).toBe("対応している画像形式はJPEG、PNG、WebPです");
  });
});

describe("shouldDeleteOldAvatar", () => {
  it("previousUrl が null の場合は false", () => {
    expect(shouldDeleteOldAvatar(null, null, false)).toBe(false);
  });

  it("previousUrl が null で新しいファイルがある場合も false", () => {
    expect(shouldDeleteOldAvatar(null, "new/path.jpg", true)).toBe(false);
  });

  it("previousUrl があり newPath が null の場合は true (画像削除)", () => {
    expect(
      shouldDeleteOldAvatar("https://example.com/avatars/old.jpg", null, false),
    ).toBe(true);
  });

  it("previousUrl があり hasNewFile が true の場合は true (画像差し替え)", () => {
    expect(
      shouldDeleteOldAvatar(
        "https://example.com/avatars/old.jpg",
        "new/path.jpg",
        true,
      ),
    ).toBe(true);
  });

  it("previousUrl があり newPath も hasNewFile も false でない場合は false", () => {
    expect(
      shouldDeleteOldAvatar(
        "https://example.com/avatars/old.jpg",
        "existing/path.jpg",
        false,
      ),
    ).toBe(false);
  });

  it("previousUrl があり newPath が null かつ hasNewFile が true の場合は true", () => {
    expect(
      shouldDeleteOldAvatar("https://example.com/avatars/old.jpg", null, true),
    ).toBe(true);
  });
});

describe("extractAvatarPathFromUrl", () => {
  it("正常な Supabase Storage URL からパスを抽出する", () => {
    expect(
      extractAvatarPathFromUrl(
        "https://xxxx.supabase.co/storage/v1/object/public/avatars/userid/12345.jpg",
      ),
    ).toBe("userid/12345.jpg");
  });

  it("ネストしたパスからも正しく抽出する", () => {
    expect(
      extractAvatarPathFromUrl(
        "https://example.com/storage/v1/object/public/avatars/abc/def/image.png",
      ),
    ).toBe("abc/def/image.png");
  });

  it("/avatars/ が含まれない URL は null を返す", () => {
    expect(
      extractAvatarPathFromUrl("https://example.com/storage/v1/object/public/"),
    ).toBeNull();
  });

  it("空文字列に対しては null を返す", () => {
    expect(extractAvatarPathFromUrl("")).toBeNull();
  });

  it("/avatars/ のみで後続パスがない URL は null を返す", () => {
    // /avatars/ の後に何もない場合、正規表現の (.+)$ はマッチしない
    expect(extractAvatarPathFromUrl("https://example.com/avatars/")).toBeNull();
  });
});
