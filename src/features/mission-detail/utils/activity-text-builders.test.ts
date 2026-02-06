import {
  buildPosterActivityText,
  buildPostingActivityText,
  getArtifactTypeLabel,
} from "./activity-text-builders";

describe("buildPosterActivityText", () => {
  it("should build text with all fields", () => {
    expect(
      buildPosterActivityText(
        "東京都",
        "千代田区",
        "001",
        "中央掲示板",
        "良好",
      ),
    ).toBe("東京都千代田区 001 (中央掲示板)に貼付 - 状況: 良好");
  });

  it("should build text without boardName", () => {
    expect(
      buildPosterActivityText("大阪府", "大阪市", "002", null, "破損あり"),
    ).toBe("大阪府大阪市 002に貼付 - 状況: 破損あり");
  });

  it("should build text without boardNote", () => {
    expect(
      buildPosterActivityText("北海道", "札幌市", "003", "駅前", null),
    ).toBe("北海道札幌市 003 (駅前)に貼付");
  });

  it("should build text without boardName and boardNote", () => {
    expect(buildPosterActivityText("福岡県", "福岡市", "004")).toBe(
      "福岡県福岡市 004に貼付",
    );
  });

  it("should handle undefined boardName and boardNote", () => {
    expect(
      buildPosterActivityText("京都府", "京都市", "005", undefined, undefined),
    ).toBe("京都府京都市 005に貼付");
  });
});

describe("buildPostingActivityText", () => {
  it("should build text with count and location", () => {
    expect(buildPostingActivityText(100, "渋谷区")).toBe("100枚を渋谷区に配布");
  });

  it("should handle zero count", () => {
    expect(buildPostingActivityText(0, "新宿区")).toBe("0枚を新宿区に配布");
  });

  it("should handle large count", () => {
    expect(buildPostingActivityText(10000, "港区")).toBe("10000枚を港区に配布");
  });

  it("should handle undefined locationText", () => {
    expect(buildPostingActivityText(50)).toBe("50枚をに配布");
  });
});

describe("getArtifactTypeLabel", () => {
  it("should return the key for known artifact types", () => {
    expect(getArtifactTypeLabel("LINK")).toBe("LINK");
    expect(getArtifactTypeLabel("TEXT")).toBe("TEXT");
    expect(getArtifactTypeLabel("IMAGE")).toBe("IMAGE");
    expect(getArtifactTypeLabel("POSTER")).toBe("POSTER");
    expect(getArtifactTypeLabel("POSTING")).toBe("POSTING");
  });

  it("should return OTHER for unknown artifact type", () => {
    expect(getArtifactTypeLabel("UNKNOWN_TYPE")).toBe("OTHER");
  });

  it("should return OTHER for empty string", () => {
    expect(getArtifactTypeLabel("")).toBe("OTHER");
  });
});
