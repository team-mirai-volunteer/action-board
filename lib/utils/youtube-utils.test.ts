import { isYouTubeUrl, normalizeYouTubeUrl } from "./youtube-utils";

describe("youtube-utils", () => {
  describe("normalizeYouTubeUrl", () => {
    it("youtube.com URLを正規化する", () => {
      const url = "https://www.youtube.com/watch?v=3D0djcN6aWo";
      const result = normalizeYouTubeUrl(url);
      expect(result).toBe("https://www.youtube.com/watch?v=3D0djcN6aWo");
    });

    it("youtu.be URLを正規化する", () => {
      const url = "https://youtu.be/3D0djcN6aWo";
      const result = normalizeYouTubeUrl(url);
      expect(result).toBe("https://www.youtube.com/watch?v=3D0djcN6aWo");
    });

    it("youtube.com（wwwなし）URLを正規化する", () => {
      const url = "https://youtube.com/watch?v=3D0djcN6aWo";
      const result = normalizeYouTubeUrl(url);
      expect(result).toBe("https://www.youtube.com/watch?v=3D0djcN6aWo");
    });

    it("追加パラメータ付きのURLを正規化する", () => {
      const url =
        "https://www.youtube.com/watch?v=3D0djcN6aWo&t=123s&list=PLrAXtmRdnEQy4QnTqXRadJ6P-bQn_88n1";
      const result = normalizeYouTubeUrl(url);
      expect(result).toBe("https://www.youtube.com/watch?v=3D0djcN6aWo");
    });

    it("youtu.beの追加パラメータ付きURLを正規化する", () => {
      const url = "https://youtu.be/3D0djcN6aWo?t=123s";
      const result = normalizeYouTubeUrl(url);
      expect(result).toBe("https://www.youtube.com/watch?v=3D0djcN6aWo");
    });

    it("無効なYouTube URLに対してnullを返す", () => {
      const url = "https://example.com/video";
      const result = normalizeYouTubeUrl(url);
      expect(result).toBeNull();
    });

    it("vパラメータがないyoutube.com URLに対してnullを返す", () => {
      const url = "https://www.youtube.com/channel/UC123456789";
      const result = normalizeYouTubeUrl(url);
      expect(result).toBeNull();
    });

    it("無効なURL文字列に対してnullを返す", () => {
      const url = "not-a-valid-url";
      const result = normalizeYouTubeUrl(url);
      expect(result).toBeNull();
    });

    it("空文字列に対してnullを返す", () => {
      const url = "";
      const result = normalizeYouTubeUrl(url);
      expect(result).toBeNull();
    });
  });

  describe("isYouTubeUrl", () => {
    it("有効なyoutube.com URLに対してtrueを返す", () => {
      const url = "https://www.youtube.com/watch?v=3D0djcN6aWo";
      const result = isYouTubeUrl(url);
      expect(result).toBe(true);
    });

    it("有効なyoutu.be URLに対してtrueを返す", () => {
      const url = "https://youtu.be/3D0djcN6aWo";
      const result = isYouTubeUrl(url);
      expect(result).toBe(true);
    });

    it("無効なURLに対してfalseを返す", () => {
      const url = "https://example.com/video";
      const result = isYouTubeUrl(url);
      expect(result).toBe(false);
    });

    it("空文字列に対してfalseを返す", () => {
      const url = "";
      const result = isYouTubeUrl(url);
      expect(result).toBe(false);
    });

    it("無効なURL文字列に対してfalseを返す", () => {
      const url = "not-a-valid-url";
      const result = isYouTubeUrl(url);
      expect(result).toBe(false);
    });
  });

  describe("URL正規化の一貫性テスト", () => {
    it("同じ動画の異なるURL形式が同じ正規化結果になる", () => {
      const videoId = "3D0djcN6aWo";
      const urls = [
        `https://www.youtube.com/watch?v=${videoId}`,
        `https://youtube.com/watch?v=${videoId}`,
        `https://youtu.be/${videoId}`,
        `https://www.youtube.com/watch?v=${videoId}&t=123s`,
        `https://youtu.be/${videoId}?t=123s`,
      ];

      const expectedResult = `https://www.youtube.com/watch?v=${videoId}`;

      for (const url of urls) {
        const result = normalizeYouTubeUrl(url);
        expect(result).toBe(expectedResult);
      }
    });
  });
});
