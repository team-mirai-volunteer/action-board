import type { YouTubeVideoDetails } from "../services/youtube-video-sync-service";
import {
  getLatestPublishedAfter,
  getOldestPublishedBefore,
  toStatsRecord,
  toVideoRecord,
} from "./video-record-utils";

const createVideoDetails = (
  overrides: Partial<YouTubeVideoDetails> = {},
): YouTubeVideoDetails => ({
  id: "test-video-id",
  snippet: {
    title: "テスト動画",
    description: "テスト説明文",
    channelId: "channel-123",
    channelTitle: "テストチャンネル",
    publishedAt: "2025-01-01T00:00:00Z",
    tags: ["tag1", "tag2"],
    thumbnails: {
      default: { url: "https://example.com/default.jpg" },
      medium: { url: "https://example.com/medium.jpg" },
      high: { url: "https://example.com/high.jpg" },
    },
  },
  contentDetails: {
    duration: "PT10M30S",
  },
  statistics: {
    viewCount: "12345",
    likeCount: "678",
    commentCount: "90",
  },
  ...overrides,
});

describe("YouTube動画レコード変換ユーティリティ", () => {
  describe("toVideoRecord", () => {
    it("全フィールドありの場合、正しいレコードに変換する", () => {
      const video = createVideoDetails();
      const record = toVideoRecord(video);

      expect(record).toEqual({
        video_id: "test-video-id",
        video_url: "https://www.youtube.com/watch?v=test-video-id",
        title: "テスト動画",
        description: "テスト説明文",
        thumbnail_url: "https://example.com/high.jpg",
        channel_id: "channel-123",
        channel_title: "テストチャンネル",
        published_at: "2025-01-01T00:00:00Z",
        duration: "PT10M30S",
        tags: ["tag1", "tag2"],
        is_active: true,
      });
    });

    it("optionalフィールドがない場合、nullにフォールバックする", () => {
      const video = createVideoDetails({
        snippet: {
          title: "最小動画",
          description: "",
          channelId: "ch-1",
          channelTitle: "",
          publishedAt: "",
          thumbnails: {},
        },
        contentDetails: {
          duration: "",
        },
      });
      const record = toVideoRecord(video);

      expect(record.description).toBeNull();
      expect(record.thumbnail_url).toBeNull();
      expect(record.channel_title).toBeNull();
      expect(record.published_at).toBeNull();
      expect(record.duration).toBeNull();
      expect(record.tags).toBeNull();
    });

    it("thumbnailがhighのみ欠落の場合、mediumにフォールバックする", () => {
      const video = createVideoDetails({
        snippet: {
          title: "動画",
          description: "説明",
          channelId: "ch-1",
          channelTitle: "チャンネル",
          publishedAt: "2025-01-01T00:00:00Z",
          thumbnails: {
            medium: { url: "https://example.com/medium.jpg" },
            default: { url: "https://example.com/default.jpg" },
          },
        },
      });
      const record = toVideoRecord(video);

      expect(record.thumbnail_url).toBe("https://example.com/medium.jpg");
    });

    it("thumbnailがdefaultのみの場合、defaultにフォールバックする", () => {
      const video = createVideoDetails({
        snippet: {
          title: "動画",
          description: "説明",
          channelId: "ch-1",
          channelTitle: "チャンネル",
          publishedAt: "2025-01-01T00:00:00Z",
          thumbnails: {
            default: { url: "https://example.com/default.jpg" },
          },
        },
      });
      const record = toVideoRecord(video);

      expect(record.thumbnail_url).toBe("https://example.com/default.jpg");
    });
  });

  describe("toStatsRecord", () => {
    it("全統計ありの場合、文字列を数値に変換する", () => {
      const video = createVideoDetails();
      const record = toStatsRecord("vid-1", video, "2025-06-01");

      expect(record).toEqual({
        video_id: "vid-1",
        recorded_at: "2025-06-01",
        view_count: 12345,
        like_count: 678,
        comment_count: 90,
      });
    });

    it("統計がnullの場合、nullを返す", () => {
      const video = createVideoDetails({
        statistics: {} as YouTubeVideoDetails["statistics"],
      });
      const record = toStatsRecord("vid-1", video, "2025-06-01");

      expect(record.view_count).toBeNull();
      expect(record.like_count).toBeNull();
      expect(record.comment_count).toBeNull();
    });

    it("文字列の数値を正しくパースする", () => {
      const video = createVideoDetails({
        statistics: {
          viewCount: "1000000",
          likeCount: "0",
          commentCount: "1",
        },
      });
      const record = toStatsRecord("vid-1", video, "2025-06-01");

      expect(record.view_count).toBe(1000000);
      expect(record.like_count).toBe(0);
      expect(record.comment_count).toBe(1);
    });
  });

  describe("getLatestPublishedAfter", () => {
    it("複数動画から最新の公開日+1秒を返す", () => {
      const videos = [
        { published_at: "2025-01-01T00:00:00.000Z" },
        { published_at: "2025-06-15T12:00:00.000Z" },
        { published_at: "2025-03-10T06:00:00.000Z" },
      ];
      const result = getLatestPublishedAfter(videos);

      expect(result).toBe(new Date("2025-06-15T12:00:01.000Z").toISOString());
    });

    it("空配列の場合はundefinedを返す", () => {
      expect(getLatestPublishedAfter([])).toBeUndefined();
    });

    it("全てnullの配列の場合はundefinedを返す", () => {
      const videos = [{ published_at: null }, { published_at: null }];
      expect(getLatestPublishedAfter(videos)).toBeUndefined();
    });

    it("nullと日付が混在する場合、有効な日付のみで最新を求める", () => {
      const videos = [
        { published_at: null },
        { published_at: "2025-04-01T00:00:00.000Z" },
        { published_at: null },
      ];
      const result = getLatestPublishedAfter(videos);

      expect(result).toBe(new Date("2025-04-01T00:00:01.000Z").toISOString());
    });
  });

  describe("getOldestPublishedBefore", () => {
    it("複数動画から最古の公開日-1秒を返す", () => {
      const videos = [
        { published_at: "2025-01-01T00:00:00.000Z" },
        { published_at: "2025-06-15T12:00:00.000Z" },
        { published_at: "2025-03-10T06:00:00.000Z" },
      ];
      const result = getOldestPublishedBefore(videos);

      expect(result).toBe(new Date("2024-12-31T23:59:59.000Z").toISOString());
    });

    it("空配列の場合はundefinedを返す", () => {
      expect(getOldestPublishedBefore([])).toBeUndefined();
    });

    it("全てnullの配列の場合はundefinedを返す", () => {
      const videos = [{ published_at: null }, { published_at: null }];
      expect(getOldestPublishedBefore(videos)).toBeUndefined();
    });

    it("nullと日付が混在する場合、有効な日付のみで最古を求める", () => {
      const videos = [
        { published_at: null },
        { published_at: "2025-08-20T00:00:00.000Z" },
        { published_at: null },
      ];
      const result = getOldestPublishedBefore(videos);

      expect(result).toBe(new Date("2025-08-19T23:59:59.000Z").toISOString());
    });
  });
});
