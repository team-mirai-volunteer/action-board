import {
  extractCommentIdFromUrl,
  extractVideoIdFromUrl,
  generateCommentUrl,
} from "./url-utils";

describe("YouTube URLユーティリティ", () => {
  describe("extractVideoIdFromUrl", () => {
    describe("正常系", () => {
      it("watch URLから動画IDを抽出できる", () => {
        expect(
          extractVideoIdFromUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
        ).toBe("dQw4w9WgXcQ");
      });

      it("追加パラメータ付きwatch URLから動画IDを抽出できる", () => {
        expect(
          extractVideoIdFromUrl(
            "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120",
          ),
        ).toBe("dQw4w9WgXcQ");
      });

      it("短縮URLから動画IDを抽出できる", () => {
        expect(extractVideoIdFromUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(
          "dQw4w9WgXcQ",
        );
      });

      it("埋め込みURLから動画IDを抽出できる", () => {
        expect(
          extractVideoIdFromUrl("https://www.youtube.com/embed/dQw4w9WgXcQ"),
        ).toBe("dQw4w9WgXcQ");
      });

      it("Shorts URLから動画IDを抽出できる", () => {
        expect(
          extractVideoIdFromUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ"),
        ).toBe("dQw4w9WgXcQ");
      });

      it("ライブURLから動画IDを抽出できる", () => {
        expect(
          extractVideoIdFromUrl("https://www.youtube.com/live/dQw4w9WgXcQ"),
        ).toBe("dQw4w9WgXcQ");
      });

      it("ハイフンを含む動画IDを抽出できる", () => {
        expect(
          extractVideoIdFromUrl("https://www.youtube.com/watch?v=abc-def_123"),
        ).toBe("abc-def_123");
      });
    });

    describe("異常系", () => {
      it("不正なURLの場合はnullを返す", () => {
        expect(extractVideoIdFromUrl("https://example.com/video")).toBeNull();
      });

      it("空文字の場合はnullを返す", () => {
        expect(extractVideoIdFromUrl("")).toBeNull();
      });

      it("YouTube以外のドメインの場合はnullを返す", () => {
        expect(extractVideoIdFromUrl("https://vimeo.com/123456789")).toBeNull();
      });
    });
  });

  describe("generateCommentUrl", () => {
    it("動画IDとコメントIDから正しいURLを生成する", () => {
      expect(generateCommentUrl("videoId123", "commentId456")).toBe(
        "https://www.youtube.com/watch?v=videoId123&lc=commentId456",
      );
    });

    it("ハイフンを含むIDでも正しいURLを生成する", () => {
      expect(generateCommentUrl("abc-def_123", "Ugx-abc_123")).toBe(
        "https://www.youtube.com/watch?v=abc-def_123&lc=Ugx-abc_123",
      );
    });
  });

  describe("extractCommentIdFromUrl", () => {
    describe("正常系", () => {
      it("lcパラメータからコメントIDを抽出できる", () => {
        expect(
          extractCommentIdFromUrl(
            "https://www.youtube.com/watch?v=dQw4w9WgXcQ&lc=UgxABC123",
          ),
        ).toBe("UgxABC123");
      });

      it("lcが先頭パラメータでも抽出できる", () => {
        expect(
          extractCommentIdFromUrl(
            "https://www.youtube.com/watch?lc=UgxABC123&v=dQw4w9WgXcQ",
          ),
        ).toBe("UgxABC123");
      });

      it("ハイフンを含むコメントIDを抽出できる", () => {
        expect(
          extractCommentIdFromUrl(
            "https://www.youtube.com/watch?v=dQw4w9WgXcQ&lc=Ugx-abc_123",
          ),
        ).toBe("Ugx-abc_123");
      });
    });

    describe("異常系", () => {
      it("lcパラメータがない場合はnullを返す", () => {
        expect(
          extractCommentIdFromUrl(
            "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          ),
        ).toBeNull();
      });

      it("不正なURLの場合はnullを返す", () => {
        expect(extractCommentIdFromUrl("https://example.com")).toBeNull();
      });

      it("空文字の場合はnullを返す", () => {
        expect(extractCommentIdFromUrl("")).toBeNull();
      });
    });
  });
});
