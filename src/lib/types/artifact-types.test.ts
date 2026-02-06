import { describe, expect, test } from "@jest/globals";
import { ARTIFACT_TYPES, getArtifactConfig } from "./artifact-types";

describe("YouTube URL Validation", () => {
  const regex = ARTIFACT_TYPES.YOUTUBE.validationRegex;

  describe("validationRegex", () => {
    describe("有効なURL", () => {
      test("標準的なwatch URL", () => {
        expect(regex.test("https://www.youtube.com/watch?v=abc123")).toBe(true);
        expect(regex.test("http://www.youtube.com/watch?v=abc123")).toBe(true);
      });

      test("www.なしのwatch URL", () => {
        expect(regex.test("https://youtube.com/watch?v=abc123")).toBe(true);
      });

      test("モバイルURL (m.youtube.com)", () => {
        expect(regex.test("https://m.youtube.com/watch?v=abc123")).toBe(true);
      });

      test("タイムスタンプ付きURL (&t=)", () => {
        expect(regex.test("https://www.youtube.com/watch?v=abc123&t=30")).toBe(
          true,
        );
        expect(
          regex.test("https://www.youtube.com/watch?v=abc123&t=1h30m"),
        ).toBe(true);
      });

      test("共有パラメータ付きURL (&si=)", () => {
        expect(
          regex.test("https://www.youtube.com/watch?v=abc123&si=abcdef123456"),
        ).toBe(true);
      });

      test("複数のクエリパラメータ", () => {
        expect(
          regex.test("https://www.youtube.com/watch?v=abc123&si=xxx&t=60"),
        ).toBe(true);
        expect(
          regex.test(
            "https://www.youtube.com/watch?v=abc123&list=PLxxx&index=5",
          ),
        ).toBe(true);
      });

      test("短縮URL (youtu.be)", () => {
        expect(regex.test("https://youtu.be/abc123")).toBe(true);
      });

      test("短縮URLにタイムスタンプ", () => {
        expect(regex.test("https://youtu.be/abc123?t=30")).toBe(true);
        expect(regex.test("https://youtu.be/abc123?si=xxx&t=60")).toBe(true);
      });

      test("Shorts URL", () => {
        expect(regex.test("https://www.youtube.com/shorts/abc123")).toBe(true);
        expect(regex.test("https://youtube.com/shorts/abc123")).toBe(true);
        expect(regex.test("https://m.youtube.com/shorts/abc123")).toBe(true);
      });

      test("Live URL", () => {
        expect(regex.test("https://www.youtube.com/live/abc123")).toBe(true);
        expect(regex.test("https://youtube.com/live/abc123")).toBe(true);
      });

      test("ハイフン付きの動画ID", () => {
        expect(regex.test("https://www.youtube.com/watch?v=abc-123_XYZ")).toBe(
          true,
        );
        expect(regex.test("https://youtu.be/abc-123_XYZ")).toBe(true);
      });

      test("フラグメント付きURL (#)", () => {
        expect(
          regex.test("https://www.youtube.com/watch?v=abc123#comment"),
        ).toBe(true);
      });
    });

    describe("無効なURL", () => {
      test("YouTube以外のドメイン", () => {
        expect(regex.test("https://vimeo.com/123456")).toBe(false);
        expect(regex.test("https://example.com/watch?v=abc123")).toBe(false);
      });

      test("不完全なURL", () => {
        expect(regex.test("youtube.com/watch?v=abc123")).toBe(false);
        expect(regex.test("www.youtube.com/watch?v=abc123")).toBe(false);
      });

      test("動画IDがないURL", () => {
        expect(regex.test("https://www.youtube.com/watch?v=")).toBe(false);
        expect(regex.test("https://youtu.be/")).toBe(false);
      });

      test("チャンネルページ", () => {
        expect(regex.test("https://www.youtube.com/channel/UCxxx")).toBe(false);
        expect(regex.test("https://www.youtube.com/@username")).toBe(false);
      });

      test("プレイリストページ (直接)", () => {
        expect(regex.test("https://www.youtube.com/playlist?list=PLxxx")).toBe(
          false,
        );
      });

      test("空文字列", () => {
        expect(regex.test("")).toBe(false);
      });

      test("無効な文字列", () => {
        expect(regex.test("not a url")).toBe(false);
        expect(regex.test("https://")).toBe(false);
      });
    });
  });
});

describe("getArtifactConfig", () => {
  describe("有効なアーティファクトタイプ", () => {
    test.each([
      "LINK",
      "TEXT",
      "EMAIL",
      "IMAGE",
      "IMAGE_WITH_GEOLOCATION",
      "REFERRAL",
      "POSTING",
      "POSTER",
      "QUIZ",
      "LINK_ACCESS",
      "YOUTUBE",
      "YOUTUBE_COMMENT",
      "NONE",
    ] as const)("%s の設定を正しく返す", (typeKey) => {
      const config = getArtifactConfig(typeKey);
      expect(config).toBe(ARTIFACT_TYPES[typeKey]);
    });
  });

  describe("各タイプの設定内容を検証", () => {
    test("LINK は displayName, prompt, validationRegex を持つ", () => {
      const config = getArtifactConfig("LINK");
      expect(config).toEqual(
        expect.objectContaining({
          key: "LINK",
          displayName: "リンク",
          prompt: expect.any(String),
          validationRegex: expect.any(RegExp),
        }),
      );
    });

    test("IMAGE は allowedMimeTypes と maxFileSizeMB を持つ", () => {
      const config = getArtifactConfig("IMAGE");
      expect(config).toEqual(
        expect.objectContaining({
          key: "IMAGE",
          displayName: "画像",
          allowedMimeTypes: expect.any(Array),
          maxFileSizeMB: 10,
        }),
      );
    });

    test("IMAGE_WITH_GEOLOCATION は allowedMimeTypes と maxFileSizeMB を持つ", () => {
      const config = getArtifactConfig("IMAGE_WITH_GEOLOCATION");
      expect(config).toEqual(
        expect.objectContaining({
          key: "IMAGE_WITH_GEOLOCATION",
          displayName: "画像および位置情報",
          allowedMimeTypes: expect.any(Array),
          maxFileSizeMB: 10,
        }),
      );
    });

    test("NONE は添付データ不要の設定を持つ", () => {
      const config = getArtifactConfig("NONE");
      expect(config).toEqual(
        expect.objectContaining({
          key: "NONE",
          displayName: "添付データ不要",
        }),
      );
    });
  });

  describe("無効な入力", () => {
    test("undefined の場合は NONE の設定を返す", () => {
      const config = getArtifactConfig(undefined);
      expect(config).toBe(ARTIFACT_TYPES.NONE);
    });

    test("null の場合は NONE の設定を返す", () => {
      const config = getArtifactConfig(null);
      expect(config).toBe(ARTIFACT_TYPES.NONE);
    });

    test("空文字の場合は NONE の設定を返す", () => {
      const config = getArtifactConfig("");
      expect(config).toBe(ARTIFACT_TYPES.NONE);
    });

    test("存在しないタイプキーの場合は NONE の設定を返す", () => {
      const config = getArtifactConfig("INVALID_TYPE");
      expect(config).toBe(ARTIFACT_TYPES.NONE);
    });
  });
});
