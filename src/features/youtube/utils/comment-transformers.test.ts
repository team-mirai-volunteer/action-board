import {
  enrichCommentsWithVideoInfo,
  transformToRecordedComments,
} from "./comment-transformers";

describe("enrichCommentsWithVideoInfo", () => {
  const baseComment = {
    commentId: "comment-1",
    videoId: "video-1",
    textOriginal: "Great video!" as string | null,
    publishedAt: "2025-01-01T00:00:00Z",
  };

  it("should enrich comment with video info from map", () => {
    const videoInfoMap = new Map([
      [
        "video-1",
        {
          title: "Test Video",
          videoUrl: "https://youtube.com/watch?v=video-1",
        },
      ],
    ]);
    const recordedIds = new Set<string>();

    const result = enrichCommentsWithVideoInfo(
      [baseComment],
      videoInfoMap,
      recordedIds,
    );

    expect(result).toHaveLength(1);
    expect(result[0].videoTitle).toBe("Test Video");
    expect(result[0].videoUrl).toBe("https://youtube.com/watch?v=video-1");
    expect(result[0].alreadyRecorded).toBe(false);
  });

  it("should use 'Unknown' title when video info is null", () => {
    const videoInfoMap = new Map<string, { title: string; videoUrl: string }>();
    const recordedIds = new Set<string>();

    const result = enrichCommentsWithVideoInfo(
      [baseComment],
      videoInfoMap,
      recordedIds,
    );

    expect(result[0].videoTitle).toBe("Unknown");
  });

  it("should generate fallback URL when video info is missing", () => {
    const videoInfoMap = new Map<string, { title: string; videoUrl: string }>();
    const recordedIds = new Set<string>();

    const result = enrichCommentsWithVideoInfo(
      [baseComment],
      videoInfoMap,
      recordedIds,
    );

    expect(result[0].videoUrl).toBe("https://www.youtube.com/watch?v=video-1");
  });

  it("should mark comment as already recorded when in recordedCommentIds", () => {
    const videoInfoMap = new Map([
      [
        "video-1",
        { title: "Test", videoUrl: "https://youtube.com/watch?v=video-1" },
      ],
    ]);
    const recordedIds = new Set(["comment-1"]);

    const result = enrichCommentsWithVideoInfo(
      [baseComment],
      videoInfoMap,
      recordedIds,
    );

    expect(result[0].alreadyRecorded).toBe(true);
  });

  it("should preserve textOriginal and publishedAt from source comment", () => {
    const videoInfoMap = new Map([
      [
        "video-1",
        { title: "Test", videoUrl: "https://youtube.com/watch?v=video-1" },
      ],
    ]);
    const recordedIds = new Set<string>();

    const result = enrichCommentsWithVideoInfo(
      [baseComment],
      videoInfoMap,
      recordedIds,
    );

    expect(result[0].textOriginal).toBe("Great video!");
    expect(result[0].publishedAt).toBe("2025-01-01T00:00:00Z");
  });

  it("should handle multiple comments", () => {
    const comments = [
      { ...baseComment, commentId: "c1", videoId: "v1" },
      { ...baseComment, commentId: "c2", videoId: "v2" },
    ];
    const videoInfoMap = new Map([
      ["v1", { title: "Video 1", videoUrl: "https://youtube.com/watch?v=v1" }],
      ["v2", { title: "Video 2", videoUrl: "https://youtube.com/watch?v=v2" }],
    ]);
    const recordedIds = new Set(["c1"]);

    const result = enrichCommentsWithVideoInfo(
      comments,
      videoInfoMap,
      recordedIds,
    );

    expect(result).toHaveLength(2);
    expect(result[0].alreadyRecorded).toBe(true);
    expect(result[1].alreadyRecorded).toBe(false);
  });
});

describe("transformToRecordedComments", () => {
  const baseRow = {
    comment_id: "comment-1",
    video_id: "video-1",
    detected_at: "2025-01-15T10:00:00Z" as string | null,
    youtube_video_comments: {
      text_original: "Nice video!" as string | null,
      published_at: "2025-01-01T00:00:00Z",
    },
    youtube_videos: {
      title: "Test Video",
      channel_title: "Test Channel",
      thumbnail_url: "https://img.youtube.com/vi/video-1/default.jpg" as
        | string
        | null,
      published_at: "2024-12-01T00:00:00Z" as string | null,
    },
  };

  it("should transform nested DB row to RecordedComment format", () => {
    const result = transformToRecordedComments([baseRow]);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      commentId: "comment-1",
      videoId: "video-1",
      videoTitle: "Test Video",
      videoUrl: "https://www.youtube.com/watch?v=video-1",
      thumbnailUrl: "https://img.youtube.com/vi/video-1/default.jpg",
      channelTitle: "Test Channel",
      textOriginal: "Nice video!",
      videoPublishedAt: "2024-12-01T00:00:00Z",
      commentedAt: "2025-01-01T00:00:00Z",
      recordedAt: "2025-01-15T10:00:00Z",
    });
  });

  it("should use empty string when text_original is null", () => {
    const row = {
      ...baseRow,
      youtube_video_comments: {
        text_original: null,
        published_at: "2025-01-01T00:00:00Z",
      },
    };

    const result = transformToRecordedComments([row]);

    expect(result[0].textOriginal).toBe("");
  });

  it("should fallback to current date when detected_at is null", () => {
    const now = new Date("2025-06-01T00:00:00Z");
    jest.useFakeTimers({ now });

    const row = { ...baseRow, detected_at: null };
    const result = transformToRecordedComments([row]);

    expect(result[0].recordedAt).toBe("2025-06-01T00:00:00.000Z");

    jest.useRealTimers();
  });

  it("should handle null thumbnail_url", () => {
    const row = {
      ...baseRow,
      youtube_videos: { ...baseRow.youtube_videos, thumbnail_url: null },
    };

    const result = transformToRecordedComments([row]);

    expect(result[0].thumbnailUrl).toBeNull();
  });

  it("should handle null video published_at", () => {
    const row = {
      ...baseRow,
      youtube_videos: { ...baseRow.youtube_videos, published_at: null },
    };

    const result = transformToRecordedComments([row]);

    expect(result[0].videoPublishedAt).toBeNull();
  });

  it("should transform multiple rows", () => {
    const rows = [
      baseRow,
      {
        ...baseRow,
        comment_id: "comment-2",
        video_id: "video-2",
      },
    ];

    const result = transformToRecordedComments(rows);

    expect(result).toHaveLength(2);
    expect(result[0].commentId).toBe("comment-1");
    expect(result[1].commentId).toBe("comment-2");
    expect(result[1].videoUrl).toBe("https://www.youtube.com/watch?v=video-2");
  });
});
