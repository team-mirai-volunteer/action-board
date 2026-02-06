import { ARTIFACT_TYPES } from "@/lib/types/artifact-types";
import type { AchieveMissionFormData } from "./actions";
import { buildArtifactPayload, getArtifactTypeLabel } from "./artifact-helpers";

// --- ヘルパー ---

/** 共通の基本フォームデータを返す */
function baseFormData(
  overrides: Partial<AchieveMissionFormData>,
): AchieveMissionFormData {
  return {
    missionId: "mission-1",
    requiredArtifactType: "NONE",
    ...overrides,
  } as AchieveMissionFormData;
}

/** 全てnullのペイロード */
const NULL_FIELDS = {
  link_url: null,
  text_content: null,
  image_storage_path: null,
};

// =============================================================
// buildArtifactPayload
// =============================================================
describe("buildArtifactPayload", () => {
  describe("各artifact typeに対して正しいペイロードを返す", () => {
    test("LINK type → link_urlにartifactLinkを設定", () => {
      const data = baseFormData({
        requiredArtifactType: ARTIFACT_TYPES.LINK.key,
        artifactLink: "https://example.com",
      });
      const result = buildArtifactPayload(ARTIFACT_TYPES.LINK.key, data);
      expect(result).toEqual({
        link_url: "https://example.com",
        text_content: null,
        image_storage_path: null,
      });
    });

    test("TEXT type → text_contentにartifactTextを設定", () => {
      const data = baseFormData({
        requiredArtifactType: ARTIFACT_TYPES.TEXT.key,
        artifactText: "テスト成果物テキスト",
      });
      const result = buildArtifactPayload(ARTIFACT_TYPES.TEXT.key, data);
      expect(result).toEqual({
        link_url: null,
        text_content: "テスト成果物テキスト",
        image_storage_path: null,
      });
    });

    test("EMAIL type → text_contentにartifactEmailを設定", () => {
      const data = baseFormData({
        requiredArtifactType: ARTIFACT_TYPES.EMAIL.key,
        artifactEmail: "test@example.com",
      });
      const result = buildArtifactPayload(ARTIFACT_TYPES.EMAIL.key, data);
      expect(result).toEqual({
        link_url: null,
        text_content: "test@example.com",
        image_storage_path: null,
      });
    });

    test("IMAGE type → image_storage_pathにartifactImagePathを設定", () => {
      const data = baseFormData({
        requiredArtifactType: ARTIFACT_TYPES.IMAGE.key,
        artifactImagePath: "images/test.png",
      });
      const result = buildArtifactPayload(ARTIFACT_TYPES.IMAGE.key, data);
      expect(result).toEqual({
        link_url: null,
        text_content: null,
        image_storage_path: "images/test.png",
      });
    });

    test("IMAGE_WITH_GEOLOCATION type → image_storage_pathにartifactImagePathを設定", () => {
      const data = baseFormData({
        requiredArtifactType: ARTIFACT_TYPES.IMAGE_WITH_GEOLOCATION.key,
        artifactImagePath: "images/geo-test.png",
        latitude: "35.6762",
        longitude: "139.6503",
      });
      const result = buildArtifactPayload(
        ARTIFACT_TYPES.IMAGE_WITH_GEOLOCATION.key,
        data,
      );
      expect(result).toEqual({
        link_url: null,
        text_content: null,
        image_storage_path: "images/geo-test.png",
      });
    });

    test("POSTING type → text_contentに「X枚をYに配布」形式の文字列を設定", () => {
      const data = baseFormData({
        requiredArtifactType: ARTIFACT_TYPES.POSTING.key,
        postingCount: 10,
        locationText: "渋谷区",
      });
      const result = buildArtifactPayload(ARTIFACT_TYPES.POSTING.key, data);
      expect(result).toEqual({
        link_url: null,
        text_content: "10枚を渋谷区に配布",
        image_storage_path: null,
      });
    });

    test("POSTER type → text_contentに貼付情報を設定（掲示板名・メモあり）", () => {
      const data = baseFormData({
        requiredArtifactType: ARTIFACT_TYPES.POSTER.key,
        prefecture: "東京都",
        city: "渋谷区",
        boardNumber: "A-001",
        boardName: "駅前掲示板",
        boardNote: "雨天のため注意",
      });
      const result = buildArtifactPayload(ARTIFACT_TYPES.POSTER.key, data);
      expect(result).toEqual({
        link_url: null,
        text_content:
          "東京都渋谷区 A-001 (駅前掲示板)に貼付 - 状況: 雨天のため注意",
        image_storage_path: null,
      });
    });

    test("POSTER type → 掲示板名なし・メモなしの場合", () => {
      const data = baseFormData({
        requiredArtifactType: ARTIFACT_TYPES.POSTER.key,
        prefecture: "大阪府",
        city: "大阪市",
        boardNumber: "B-002",
        boardName: "",
        boardNote: "",
      });
      const result = buildArtifactPayload(ARTIFACT_TYPES.POSTER.key, data);
      expect(result).toEqual({
        link_url: null,
        text_content: "大阪府大阪市 B-002に貼付",
        image_storage_path: null,
      });
    });

    test("POSTER type → 掲示板名あり・メモなしの場合", () => {
      const data = baseFormData({
        requiredArtifactType: ARTIFACT_TYPES.POSTER.key,
        prefecture: "北海道",
        city: "札幌市",
        boardNumber: "C-003",
        boardName: "公園前",
        boardNote: "",
      });
      const result = buildArtifactPayload(ARTIFACT_TYPES.POSTER.key, data);
      expect(result).toEqual({
        link_url: null,
        text_content: "北海道札幌市 C-003 (公園前)に貼付",
        image_storage_path: null,
      });
    });

    test("QUIZ type → 全フィールドnull", () => {
      const data = baseFormData({
        requiredArtifactType: ARTIFACT_TYPES.QUIZ.key,
      });
      const result = buildArtifactPayload(ARTIFACT_TYPES.QUIZ.key, data);
      expect(result).toEqual(NULL_FIELDS);
    });

    test("YOUTUBE type → link_urlにartifactLinkを設定", () => {
      const data = baseFormData({
        requiredArtifactType: ARTIFACT_TYPES.YOUTUBE.key,
        artifactLink: "https://www.youtube.com/watch?v=abc123",
      });
      const result = buildArtifactPayload(ARTIFACT_TYPES.YOUTUBE.key, data);
      expect(result).toEqual({
        link_url: "https://www.youtube.com/watch?v=abc123",
        text_content: null,
        image_storage_path: null,
      });
    });

    test("YOUTUBE_COMMENT type → link_urlにartifactLinkを設定", () => {
      const data = baseFormData({
        requiredArtifactType: ARTIFACT_TYPES.YOUTUBE_COMMENT.key,
        artifactLink: "https://www.youtube.com/watch?v=abc123&lc=commentId123",
      });
      const result = buildArtifactPayload(
        ARTIFACT_TYPES.YOUTUBE_COMMENT.key,
        data,
      );
      expect(result).toEqual({
        link_url: "https://www.youtube.com/watch?v=abc123&lc=commentId123",
        text_content: null,
        image_storage_path: null,
      });
    });
  });

  describe("不明なartifact type", () => {
    test("登録されていないtype → 全フィールドnull", () => {
      const data = baseFormData({
        requiredArtifactType: "UNKNOWN_TYPE",
      });
      const result = buildArtifactPayload("UNKNOWN_TYPE", data);
      expect(result).toEqual(NULL_FIELDS);
    });
  });

  describe("typeが一致しない場合（ミスマッチ）", () => {
    test("LINK builderにTEXT dataを渡す → 全フィールドnull", () => {
      const data = baseFormData({
        requiredArtifactType: ARTIFACT_TYPES.TEXT.key,
        artifactText: "テキスト内容",
      });
      const result = buildArtifactPayload(ARTIFACT_TYPES.LINK.key, data);
      expect(result).toEqual(NULL_FIELDS);
    });

    test("TEXT builderにLINK dataを渡す → 全フィールドnull", () => {
      const data = baseFormData({
        requiredArtifactType: ARTIFACT_TYPES.LINK.key,
        artifactLink: "https://example.com",
      });
      const result = buildArtifactPayload(ARTIFACT_TYPES.TEXT.key, data);
      expect(result).toEqual(NULL_FIELDS);
    });

    test("IMAGE builderにLINK dataを渡す → 全フィールドnull", () => {
      const data = baseFormData({
        requiredArtifactType: ARTIFACT_TYPES.LINK.key,
        artifactLink: "https://example.com",
      });
      const result = buildArtifactPayload(ARTIFACT_TYPES.IMAGE.key, data);
      expect(result).toEqual(NULL_FIELDS);
    });

    test("EMAIL builderにIMAGE dataを渡す → 全フィールドnull", () => {
      const data = baseFormData({
        requiredArtifactType: ARTIFACT_TYPES.IMAGE.key,
        artifactImagePath: "images/test.png",
      });
      const result = buildArtifactPayload(ARTIFACT_TYPES.EMAIL.key, data);
      expect(result).toEqual(NULL_FIELDS);
    });

    test("POSTING builderにLINK dataを渡す → 全フィールドnull", () => {
      const data = baseFormData({
        requiredArtifactType: ARTIFACT_TYPES.LINK.key,
        artifactLink: "https://example.com",
      });
      const result = buildArtifactPayload(ARTIFACT_TYPES.POSTING.key, data);
      expect(result).toEqual(NULL_FIELDS);
    });

    test("POSTER builderにTEXT dataを渡す → 全フィールドnull", () => {
      const data = baseFormData({
        requiredArtifactType: ARTIFACT_TYPES.TEXT.key,
        artifactText: "テキスト",
      });
      const result = buildArtifactPayload(ARTIFACT_TYPES.POSTER.key, data);
      expect(result).toEqual(NULL_FIELDS);
    });

    test("YOUTUBE builderにTEXT dataを渡す → 全フィールドnull", () => {
      const data = baseFormData({
        requiredArtifactType: ARTIFACT_TYPES.TEXT.key,
        artifactText: "テキスト",
      });
      const result = buildArtifactPayload(ARTIFACT_TYPES.YOUTUBE.key, data);
      expect(result).toEqual(NULL_FIELDS);
    });

    test("YOUTUBE_COMMENT builderにIMAGE dataを渡す → 全フィールドnull", () => {
      const data = baseFormData({
        requiredArtifactType: ARTIFACT_TYPES.IMAGE.key,
        artifactImagePath: "images/test.png",
      });
      const result = buildArtifactPayload(
        ARTIFACT_TYPES.YOUTUBE_COMMENT.key,
        data,
      );
      expect(result).toEqual(NULL_FIELDS);
    });

    test("IMAGE_WITH_GEOLOCATION builderにPOSTING dataを渡す → 全フィールドnull", () => {
      const data = baseFormData({
        requiredArtifactType: ARTIFACT_TYPES.POSTING.key,
        postingCount: 5,
        locationText: "新宿",
      });
      const result = buildArtifactPayload(
        ARTIFACT_TYPES.IMAGE_WITH_GEOLOCATION.key,
        data,
      );
      expect(result).toEqual(NULL_FIELDS);
    });
  });
});

// =============================================================
// getArtifactTypeLabel
// =============================================================
describe("getArtifactTypeLabel", () => {
  describe("既知のartifact type", () => {
    test.each([
      ["LINK"],
      ["TEXT"],
      ["EMAIL"],
      ["IMAGE"],
      ["IMAGE_WITH_GEOLOCATION"],
      ["REFERRAL"],
      ["POSTING"],
      ["POSTER"],
      ["QUIZ"],
      ["LINK_ACCESS"],
      ["YOUTUBE"],
      ["YOUTUBE_COMMENT"],
      ["NONE"],
    ])("%s → そのkeyを返す", (key) => {
      expect(getArtifactTypeLabel(key)).toBe(key);
    });
  });

  describe("不明なartifact type", () => {
    test("登録されていないtype → 'OTHER'を返す", () => {
      expect(getArtifactTypeLabel("UNKNOWN_TYPE")).toBe("OTHER");
    });

    test("空文字列 → 'OTHER'を返す", () => {
      expect(getArtifactTypeLabel("")).toBe("OTHER");
    });
  });
});
