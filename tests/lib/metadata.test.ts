import {
  createDefaultMetadata,
  generateRootMetadata,
  isValidImageUrl,
  sanitizeImageUrl,
} from "../../lib/metadata";

describe("generateRootMetadata", () => {
  it("ルートメタデータ生成", async () => {
    const result = await generateRootMetadata({});
    expect(result.title).toBeDefined();
  });

  it("パラメータ付きメタデータ生成", async () => {
    const params = Promise.resolve({ slug: "test" });
    const result = await generateRootMetadata({ params });
    expect(result).toBeDefined();
  });
});

describe("createDefaultMetadata", () => {
  it("デフォルトメタデータ作成", () => {
    const result = createDefaultMetadata();
    expect(result.title).toBeDefined();
  });

  it("メタデータ構造確認", () => {
    const result = createDefaultMetadata();
    expect(result.openGraph).toBeDefined();
  });
});

describe("isValidImageUrl", () => {
  it("有効なURL検証", () => {
    const result = isValidImageUrl("https://example.com/image.jpg");
    expect(result).toBe(true);
  });

  it("空文字列URL検証", () => {
    const result = isValidImageUrl("");
    expect(result).toBe(true);
  });
});
