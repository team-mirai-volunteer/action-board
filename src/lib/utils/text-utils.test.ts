import { extractHashtags } from "./text-utils";

describe("extractHashtags", () => {
  describe("英語ハッシュタグ", () => {
    it("#hello を抽出する", () => {
      expect(extractHashtags("Hello #hello world")).toEqual(["#hello"]);
    });

    it("#TeamMirai を抽出する", () => {
      expect(extractHashtags("Check out #TeamMirai")).toEqual(["#TeamMirai"]);
    });
  });

  describe("日本語ハッシュタグ", () => {
    it("ひらがなハッシュタグを抽出する", () => {
      expect(extractHashtags("動画 #チームみらい です")).toEqual([
        "#チームみらい",
      ]);
    });

    it("カタカナハッシュタグを抽出する", () => {
      expect(extractHashtags("#カタカナ テスト")).toEqual(["#カタカナ"]);
    });

    it("漢字ハッシュタグを抽出する", () => {
      expect(extractHashtags("#政治改革 について")).toEqual(["#政治改革"]);
    });
  });

  describe("複数タグ混在", () => {
    it("英語と日本語のハッシュタグを同時に抽出する", () => {
      const result = extractHashtags("#チームみらい の活動 #teammirai #政治");
      expect(result).toEqual(["#チームみらい", "#teammirai", "#政治"]);
    });

    it("テキスト中の複数のハッシュタグを全て抽出する", () => {
      const result = extractHashtags("#tag1 some text #tag2 more #tag3");
      expect(result).toEqual(["#tag1", "#tag2", "#tag3"]);
    });
  });

  describe("タグなし", () => {
    it("ハッシュタグがない場合は空配列を返す", () => {
      expect(extractHashtags("No hashtags here")).toEqual([]);
    });
  });

  describe("空文字", () => {
    it("空文字列の場合は空配列を返す", () => {
      expect(extractHashtags("")).toEqual([]);
    });
  });

  describe("特殊文字の境界", () => {
    it("スペースでハッシュタグが区切られる", () => {
      expect(extractHashtags("#hello world")).toEqual(["#hello"]);
    });

    it("数字を含むハッシュタグを抽出する", () => {
      expect(extractHashtags("#tag123")).toEqual(["#tag123"]);
    });

    it("アンダースコアを含むハッシュタグを抽出する", () => {
      expect(extractHashtags("#team_mirai")).toEqual(["#team_mirai"]);
    });

    it("#のみの場合はマッチしない", () => {
      expect(extractHashtags("# alone")).toEqual([]);
    });

    it("連続するハッシュタグを抽出する", () => {
      expect(extractHashtags("#tag1#tag2")).toEqual(["#tag1", "#tag2"]);
    });

    it("ひらがな・カタカナ・漢字混在のタグを抽出する", () => {
      expect(extractHashtags("#チームみらい応援団")).toEqual([
        "#チームみらい応援団",
      ]);
    });
  });
});
