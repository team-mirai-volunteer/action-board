import type { CommentThread, LikedVideoItem } from "../services/youtube-client";
import {
  buildCommentCacheRecord,
  buildLikeVideoRecord,
  filterNewIds,
  groupCommentsByUser,
  mapLikedVideoItem,
} from "./sync-helpers";

describe("mapLikedVideoItem", () => {
  it("mediumサムネイルがある場合はそれを優先する", () => {
    const item: LikedVideoItem = {
      id: "video123",
      snippet: {
        publishedAt: "2025-01-15T00:00:00Z",
        channelId: "ch1",
        channelTitle: "Channel One",
        title: "Test Video",
        thumbnails: {
          default: { url: "https://example.com/default.jpg" },
          medium: { url: "https://example.com/medium.jpg" },
        },
      },
    };

    const result = mapLikedVideoItem(item);

    expect(result).toEqual({
      videoId: "video123",
      title: "Test Video",
      channelId: "ch1",
      channelTitle: "Channel One",
      thumbnailUrl: "https://example.com/medium.jpg",
      publishedAt: "2025-01-15T00:00:00Z",
    });
  });

  it("mediumサムネイルがない場合はdefaultを使用する", () => {
    const item: LikedVideoItem = {
      id: "video456",
      snippet: {
        publishedAt: "2025-02-01T12:00:00Z",
        channelId: "ch2",
        channelTitle: "Channel Two",
        title: "Another Video",
        thumbnails: {
          default: { url: "https://example.com/default.jpg" },
        },
      },
    };

    const result = mapLikedVideoItem(item);

    expect(result.thumbnailUrl).toBe("https://example.com/default.jpg");
  });

  it("サムネイルが両方ない場合はundefinedになる", () => {
    const item: LikedVideoItem = {
      id: "video789",
      snippet: {
        publishedAt: "2025-03-01T00:00:00Z",
        channelId: "ch3",
        channelTitle: "Channel Three",
        title: "No Thumbnail",
        thumbnails: {},
      },
    };

    const result = mapLikedVideoItem(item);

    expect(result.thumbnailUrl).toBeUndefined();
  });
});

describe("buildLikeVideoRecord", () => {
  it("APIの動画詳細からDB保存用レコードを構築する", () => {
    const detail = {
      id: "video-123",
      snippet: {
        title: "Test Video",
        description: "A test video description",
        thumbnails: {
          medium: { url: "https://example.com/medium.jpg" },
          default: { url: "https://example.com/default.jpg" },
        },
        channelId: "channel-1",
        channelTitle: "Test Channel",
        publishedAt: "2025-01-15T10:00:00Z",
        tags: ["tag1", "tag2"],
      },
    };

    const record = buildLikeVideoRecord(detail);

    expect(record).toEqual({
      video_id: "video-123",
      video_url: "https://www.youtube.com/watch?v=video-123",
      title: "Test Video",
      description: "A test video description",
      thumbnail_url: "https://example.com/medium.jpg",
      channel_id: "channel-1",
      channel_title: "Test Channel",
      published_at: "2025-01-15T10:00:00Z",
      tags: ["tag1", "tag2"],
      is_active: true,
    });
  });

  it("descriptionがない場合はnullにする", () => {
    const detail = {
      id: "video-456",
      snippet: {
        title: "No Description Video",
        thumbnails: {
          default: { url: "https://example.com/default.jpg" },
        },
        channelId: "channel-1",
        channelTitle: "Test Channel",
        publishedAt: "2025-01-15T10:00:00Z",
      },
    };

    const record = buildLikeVideoRecord(detail);

    expect(record.description).toBeNull();
    expect(record.tags).toEqual([]);
  });

  it("mediumサムネイルがない場合はdefaultを使用する", () => {
    const detail = {
      id: "video-789",
      snippet: {
        title: "Test",
        thumbnails: {
          default: { url: "https://example.com/default.jpg" },
        },
        channelId: "channel-1",
        channelTitle: "Test Channel",
        publishedAt: "2025-01-15T10:00:00Z",
      },
    };

    const record = buildLikeVideoRecord(detail);

    expect(record.thumbnail_url).toBe("https://example.com/default.jpg");
  });

  it("サムネイルがない場合はnullにする", () => {
    const detail = {
      id: "video-000",
      snippet: {
        title: "No Thumbnail",
        thumbnails: {},
        channelId: "channel-1",
        channelTitle: "Test Channel",
        publishedAt: "2025-01-15T10:00:00Z",
      },
    };

    const record = buildLikeVideoRecord(detail);

    expect(record.thumbnail_url).toBeNull();
  });
});

describe("filterNewIds", () => {
  it("既存IDセットに含まれないIDのみを返す", () => {
    const allIds = ["a", "b", "c", "d"];
    const existingIds = new Set(["b", "d"]);

    const result = filterNewIds(allIds, existingIds);

    expect(result).toEqual(["a", "c"]);
  });

  it("全て既存の場合は空配列を返す", () => {
    const allIds = ["a", "b"];
    const existingIds = new Set(["a", "b"]);

    const result = filterNewIds(allIds, existingIds);

    expect(result).toEqual([]);
  });

  it("既存IDが空の場合は全IDを返す", () => {
    const allIds = ["a", "b", "c"];
    const existingIds = new Set<string>();

    const result = filterNewIds(allIds, existingIds);

    expect(result).toEqual(["a", "b", "c"]);
  });

  it("空の入力配列に対して空配列を返す", () => {
    const result = filterNewIds([], new Set(["a"]));

    expect(result).toEqual([]);
  });
});

describe("buildCommentCacheRecord", () => {
  it("CommentThreadからDB保存用のレコードを構築する", () => {
    const comment: CommentThread = {
      id: "thread-1",
      snippet: {
        videoId: "video-123",
        topLevelComment: {
          id: "comment-1",
          snippet: {
            videoId: "video-123",
            textDisplay: "Great video!",
            textOriginal: "Great video!",
            authorDisplayName: "User One",
            authorChannelId: { value: "channel-user-1" },
            publishedAt: "2025-01-15T12:00:00Z",
          },
        },
      },
    };

    const record = buildCommentCacheRecord(comment);

    expect(record).toEqual({
      video_id: "video-123",
      comment_id: "comment-1",
      author_channel_id: "channel-user-1",
      author_display_name: "User One",
      text_display: "Great video!",
      text_original: "Great video!",
      published_at: "2025-01-15T12:00:00Z",
    });
  });
});

describe("groupCommentsByUser", () => {
  const channelIdToUserId = new Map([
    ["channel-a", "user-1"],
    ["channel-b", "user-2"],
  ]);

  it("コメントをユーザーIDごとにグループ化する", () => {
    const comments = [
      {
        comment_id: "c1",
        video_id: "v1",
        author_channel_id: "channel-a",
        author_display_name: "User A",
        text_display: "Comment 1",
        text_original: "Comment 1",
        published_at: "2025-01-15T10:00:00Z",
      },
      {
        comment_id: "c2",
        video_id: "v1",
        author_channel_id: "channel-b",
        author_display_name: "User B",
        text_display: "Comment 2",
        text_original: "Comment 2",
        published_at: "2025-01-15T11:00:00Z",
      },
      {
        comment_id: "c3",
        video_id: "v2",
        author_channel_id: "channel-a",
        author_display_name: "User A",
        text_display: "Comment 3",
        text_original: "Comment 3",
        published_at: "2025-01-15T12:00:00Z",
      },
    ];

    const result = groupCommentsByUser(comments, channelIdToUserId);

    expect(result.size).toBe(2);
    expect(result.get("user-1")).toHaveLength(2);
    expect(result.get("user-2")).toHaveLength(1);
    expect(result.get("user-1")![0].commentId).toBe("c1");
    expect(result.get("user-1")![1].commentId).toBe("c3");
    expect(result.get("user-2")![0].commentId).toBe("c2");
  });

  it("マップにないチャンネルIDのコメントは無視する", () => {
    const comments = [
      {
        comment_id: "c1",
        video_id: "v1",
        author_channel_id: "channel-unknown",
        author_display_name: "Unknown",
        text_display: "Hello",
        text_original: "Hello",
        published_at: "2025-01-15T10:00:00Z",
      },
    ];

    const result = groupCommentsByUser(comments, channelIdToUserId);

    expect(result.size).toBe(0);
  });

  it("空のコメント配列に対して空のMapを返す", () => {
    const result = groupCommentsByUser([], channelIdToUserId);

    expect(result.size).toBe(0);
  });

  it("CachedComment形式に正しく変換する", () => {
    const comments = [
      {
        comment_id: "c1",
        video_id: "v1",
        author_channel_id: "channel-a",
        author_display_name: null,
        text_display: null,
        text_original: null,
        published_at: "2025-01-15T10:00:00Z",
      },
    ];

    const result = groupCommentsByUser(comments, channelIdToUserId);
    const cached = result.get("user-1")![0];

    expect(cached).toEqual({
      commentId: "c1",
      videoId: "v1",
      authorChannelId: "channel-a",
      authorDisplayName: null,
      textDisplay: null,
      textOriginal: null,
      publishedAt: "2025-01-15T10:00:00Z",
    });
  });
});
