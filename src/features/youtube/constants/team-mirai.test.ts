import { hasTeamMiraiTag } from "./team-mirai";

describe("hasTeamMiraiTag", () => {
  describe("タグでのマッチ", () => {
    it("タグに「チームみらい」が含まれている場合trueを返す", () => {
      expect(hasTeamMiraiTag(["チームみらい"])).toBe(true);
    });

    it("タグに「teammirai」が含まれている場合trueを返す", () => {
      expect(hasTeamMiraiTag(["teammirai"])).toBe(true);
    });

    it("タグに「team mirai」が含まれている場合trueを返す", () => {
      expect(hasTeamMiraiTag(["team mirai"])).toBe(true);
    });

    it("タグの大文字小文字を区別しない", () => {
      expect(hasTeamMiraiTag(["TeamMirai"])).toBe(true);
      expect(hasTeamMiraiTag(["TEAMMIRAI"])).toBe(true);
      expect(hasTeamMiraiTag(["TEAM MIRAI"])).toBe(true);
    });

    it("タグの部分一致でもtrueを返す", () => {
      expect(hasTeamMiraiTag(["#チームみらい応援"])).toBe(true);
    });

    it("関係ないタグのみの場合falseを返す", () => {
      expect(hasTeamMiraiTag(["政治", "日本"])).toBe(false);
    });
  });

  describe("タイトルでのマッチ", () => {
    it("タイトルに「チームみらい」が含まれている場合trueを返す", () => {
      expect(hasTeamMiraiTag(undefined, "チームみらいの活動報告")).toBe(true);
    });

    it("タイトルに「teammirai」が含まれている場合trueを返す", () => {
      expect(hasTeamMiraiTag(undefined, "TeamMirai Activity")).toBe(true);
    });

    it("タイトルに「team mirai」が含まれている場合trueを返す", () => {
      expect(hasTeamMiraiTag(undefined, "Team Mirai video")).toBe(true);
    });
  });

  describe("説明文でのマッチ", () => {
    it("説明文に「チームみらい」が含まれている場合trueを返す", () => {
      expect(
        hasTeamMiraiTag(undefined, undefined, "この動画はチームみらいについて"),
      ).toBe(true);
    });

    it("説明文に「teammirai」が含まれている場合trueを返す", () => {
      expect(hasTeamMiraiTag(undefined, undefined, "Support teammirai!")).toBe(
        true,
      );
    });
  });

  describe("チャンネル名でのマッチ", () => {
    it("チャンネル名に「チームみらい」が含まれている場合trueを返す", () => {
      expect(
        hasTeamMiraiTag(undefined, undefined, undefined, "チームみらい公式"),
      ).toBe(true);
    });

    it("チャンネル名に「teammirai」が含まれている場合trueを返す", () => {
      expect(
        hasTeamMiraiTag(undefined, undefined, undefined, "TeamMirai Official"),
      ).toBe(true);
    });
  });

  describe("マッチしないケース", () => {
    it("全てundefinedの場合falseを返す", () => {
      expect(hasTeamMiraiTag(undefined)).toBe(false);
    });

    it("全てnull/undefinedの場合falseを返す", () => {
      expect(hasTeamMiraiTag(undefined, null, null, null)).toBe(false);
    });

    it("空のタグ配列の場合falseを返す", () => {
      expect(hasTeamMiraiTag([])).toBe(false);
    });

    it("関係ない内容のみの場合falseを返す", () => {
      expect(
        hasTeamMiraiTag(
          ["政治", "日本"],
          "普通の動画",
          "普通の説明",
          "普通のチャンネル",
        ),
      ).toBe(false);
    });
  });

  describe("複数フィールドの組み合わせ", () => {
    it("タグではマッチしないがタイトルでマッチする場合trueを返す", () => {
      expect(hasTeamMiraiTag(["無関係"], "チームみらい動画")).toBe(true);
    });

    it("タグとタイトルではマッチしないが説明文でマッチする場合trueを返す", () => {
      expect(
        hasTeamMiraiTag(["無関係"], "普通のタイトル", "チームみらいの説明"),
      ).toBe(true);
    });

    it("タグ、タイトル、説明文ではマッチしないがチャンネル名でマッチする場合trueを返す", () => {
      expect(
        hasTeamMiraiTag(
          ["無関係"],
          "普通のタイトル",
          "普通の説明",
          "チームみらい公式",
        ),
      ).toBe(true);
    });
  });
});
