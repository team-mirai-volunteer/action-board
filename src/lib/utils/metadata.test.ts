jest.mock("next/font/google", () => ({
  Noto_Sans_JP: () => ({
    style: { fontFamily: "Noto Sans JP" },
    variable: "--font-noto-sans-jp",
  }),
}));

import {
  config,
  createDefaultMetadata,
  defaultUrl,
  generateRootMetadata,
  isValidImageUrl,
  sanitizeImageUrl,
} from "./metadata";

describe("defaultUrl", () => {
  test("環境変数未設定時はlocalhost:3000がデフォルト", () => {
    expect(defaultUrl).toBe("http://localhost:3000");
  });
});

describe("config", () => {
  test("タイトルが正しく設定されている", () => {
    expect(config.title).toBe("チームみらい アクションボード");
  });

  test("説明が正しく設定されている", () => {
    expect(config.description).toContain("政治活動をもっと身近に");
  });

  test("デフォルト画像パスが設定されている", () => {
    expect(config.defaultImage).toMatch(/^\/img\/ogp-default\.png/);
  });

  test("アイコン設定が正しい構造を持つ", () => {
    expect(config.icons.icon).toHaveLength(2);
    expect(config.icons.icon[0]).toEqual({ url: "/favicon.ico", sizes: "any" });
    expect(config.icons.icon[1]).toEqual({
      url: "/icon.png",
      type: "image/png",
      sizes: "32x32",
    });
    expect(config.icons.apple).toBe("/apple-icon.png");
  });
});

describe("isValidImageUrl", () => {
  test("任意のURLに対してtrueを返す（現在はTODO実装）", () => {
    expect(isValidImageUrl("https://example.com/image.png")).toBe(true);
    expect(isValidImageUrl("invalid-url")).toBe(true);
    expect(isValidImageUrl("")).toBe(true);
  });
});

describe("sanitizeImageUrl", () => {
  test("有効なURLの場合、URL文字列を返す", () => {
    expect(sanitizeImageUrl("https://example.com/image.png")).toBe(
      "https://example.com/image.png",
    );
  });

  test("URLオブジェクトで正規化された文字列を返す", () => {
    expect(sanitizeImageUrl("https://example.com/path?a=1&b=2")).toBe(
      "https://example.com/path?a=1&b=2",
    );
  });

  test("無効なURL形式の場合、nullを返す", () => {
    expect(sanitizeImageUrl("not-a-valid-url")).toBe(null);
  });

  test("空文字列の場合、nullを返す", () => {
    expect(sanitizeImageUrl("")).toBe(null);
  });

  test("プロトコルなしのURLの場合、nullを返す", () => {
    expect(sanitizeImageUrl("example.com/image.png")).toBe(null);
  });
});

describe("createDefaultMetadata", () => {
  const metadata = createDefaultMetadata();

  test("titleが正しく設定される", () => {
    expect(metadata.title).toBe(config.title);
  });

  test("descriptionが正しく設定される", () => {
    expect(metadata.description).toBe(config.description);
  });

  describe("openGraph", () => {
    test("titleが設定される", () => {
      expect(metadata.openGraph).toHaveProperty("title", config.title);
    });

    test("descriptionが設定される", () => {
      expect(metadata.openGraph).toHaveProperty(
        "description",
        config.description,
      );
    });

    test("imagesにデフォルト画像URLが含まれる", () => {
      expect(metadata.openGraph).toHaveProperty("images", [
        `${defaultUrl}${config.defaultImage}`,
      ]);
    });
  });

  describe("twitter", () => {
    test("cardがsummary_large_imageに設定される", () => {
      expect(metadata.twitter).toHaveProperty("card", "summary_large_image");
    });

    test("titleが設定される", () => {
      expect(metadata.twitter).toHaveProperty("title", config.title);
    });

    test("descriptionが設定される", () => {
      expect(metadata.twitter).toHaveProperty(
        "description",
        config.description,
      );
    });

    test("imagesにデフォルト画像URLが含まれる", () => {
      expect(metadata.twitter).toHaveProperty("images", [
        `${defaultUrl}${config.defaultImage}`,
      ]);
    });
  });

  test("iconsが正しく設定される", () => {
    expect(metadata.icons).toEqual(config.icons);
  });

  test("font-familyがother内に設定される", () => {
    expect(metadata.other).toHaveProperty("font-family", "Noto Sans JP");
  });
});

describe("generateRootMetadata", () => {
  test("createDefaultMetadataと同じ結果を返す", async () => {
    const result = await generateRootMetadata();
    const expected = createDefaultMetadata();
    expect(result).toEqual(expected);
  });
});
