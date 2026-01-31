import { describe, expect, test } from "@jest/globals";
import { ARTIFACT_TYPES } from "./artifact-types";

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
