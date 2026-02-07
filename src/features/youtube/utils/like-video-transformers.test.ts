import {
  enrichVideosWithLatestStats,
  transformValidLikesToRecordedLikes,
} from "./like-video-transformers";

describe("transformValidLikesToRecordedLikes", () => {
  const baseLike = {
    video_id: "video-1",
    detected_at: "2025-01-15T10:00:00Z" as string | null,
    created_at: "2025-01-15T09:00:00Z" as string | null,
    youtube_videos: {
      title: "Test Video",
      channel_title: "Test Channel",
      video_url: "https://www.youtube.com/watch?v=video-1" as string | null,
      thumbnail_url: "https://img.youtube.com/thumb.jpg" as string | null,
      published_at: "2024-12-01T00:00:00Z" as string | null,
    },
  };

  it("should transform a like with full video data", () => {
    const result = transformValidLikesToRecordedLikes([baseLike]);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      videoId: "video-1",
      title: "Test Video",
      channelTitle: "Test Channel",
      thumbnailUrl: "https://img.youtube.com/thumb.jpg",
      videoUrl: "https://www.youtube.com/watch?v=video-1",
      publishedAt: "2024-12-01T00:00:00Z",
      recordedAt: "2025-01-15T10:00:00Z",
    });
  });

  it("should filter out likes where youtube_videos is null", () => {
    const likes = [
      baseLike,
      { ...baseLike, video_id: "video-2", youtube_videos: null },
    ];

    const result = transformValidLikesToRecordedLikes(likes);

    expect(result).toHaveLength(1);
    expect(result[0].videoId).toBe("video-1");
  });

  it("should use 'Unknown' title when title is missing", () => {
    const like = {
      ...baseLike,
      youtube_videos: { ...baseLike.youtube_videos!, title: "" },
    };

    // Empty string is falsy, so it should fallback to "Unknown"
    const result = transformValidLikesToRecordedLikes([like]);
    expect(result[0].title).toBe("Unknown");
  });

  it("should generate fallback URL when video_url is null", () => {
    const like = {
      ...baseLike,
      youtube_videos: { ...baseLike.youtube_videos!, video_url: null },
    };

    const result = transformValidLikesToRecordedLikes([like]);

    expect(result[0].videoUrl).toBe("https://www.youtube.com/watch?v=video-1");
  });

  it("should use undefined for optional null fields", () => {
    const like = {
      ...baseLike,
      youtube_videos: {
        ...baseLike.youtube_videos!,
        channel_title: "",
        thumbnail_url: null,
        published_at: null,
      },
    };

    const result = transformValidLikesToRecordedLikes([like]);

    expect(result[0].channelTitle).toBeUndefined();
    expect(result[0].thumbnailUrl).toBeUndefined();
    expect(result[0].publishedAt).toBeUndefined();
  });

  it("should fallback to created_at when detected_at is null", () => {
    const like = { ...baseLike, detected_at: null };

    const result = transformValidLikesToRecordedLikes([like]);

    expect(result[0].recordedAt).toBe("2025-01-15T09:00:00Z");
  });

  it("should fallback to current date when both detected_at and created_at are null", () => {
    const now = new Date("2025-06-01T00:00:00Z");
    jest.useFakeTimers({ now });

    const like = { ...baseLike, detected_at: null, created_at: null };

    const result = transformValidLikesToRecordedLikes([like]);

    expect(result[0].recordedAt).toBe("2025-06-01T00:00:00.000Z");

    jest.useRealTimers();
  });
});

describe("enrichVideosWithLatestStats", () => {
  const baseVideo = {
    video_id: "video-1",
    video_url: "https://www.youtube.com/watch?v=video-1",
    title: "Test Video",
    description: "A test video" as string | null,
    thumbnail_url: "https://img.youtube.com/thumb.jpg" as string | null,
    channel_id: "channel-1",
    channel_title: "Test Channel",
    published_at: "2024-12-01T00:00:00Z",
    duration: "PT10M30S" as string | null,
    tags: ["test", "video"] as string[] | null,
    is_active: true,
    created_at: "2024-12-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    comments_synced_at: null as string | null,
    youtube_video_stats: [
      {
        view_count: 1000 as number | null,
        like_count: 50 as number | null,
        comment_count: 10 as number | null,
        recorded_at: "2025-01-01T00:00:00Z",
      },
    ],
  };

  it("should enrich video with latest stats", () => {
    const result = enrichVideosWithLatestStats([baseVideo]);

    expect(result).toHaveLength(1);
    expect(result[0].latest_view_count).toBe(1000);
    expect(result[0].latest_like_count).toBe(50);
    expect(result[0].latest_comment_count).toBe(10);
  });

  it("should select the most recent stats entry", () => {
    const video = {
      ...baseVideo,
      youtube_video_stats: [
        {
          view_count: 500,
          like_count: 20,
          comment_count: 5,
          recorded_at: "2025-01-01T00:00:00Z",
        },
        {
          view_count: 1500,
          like_count: 80,
          comment_count: 25,
          recorded_at: "2025-01-10T00:00:00Z",
        },
        {
          view_count: 800,
          like_count: 30,
          comment_count: 8,
          recorded_at: "2025-01-05T00:00:00Z",
        },
      ],
    };

    const result = enrichVideosWithLatestStats([video]);

    expect(result[0].latest_view_count).toBe(1500);
    expect(result[0].latest_like_count).toBe(80);
    expect(result[0].latest_comment_count).toBe(25);
  });

  it("should return null stats when stats array is empty", () => {
    const video = { ...baseVideo, youtube_video_stats: [] };

    const result = enrichVideosWithLatestStats([video]);

    expect(result[0].latest_view_count).toBeNull();
    expect(result[0].latest_like_count).toBeNull();
    expect(result[0].latest_comment_count).toBeNull();
  });

  it("should preserve all video fields in the output", () => {
    const result = enrichVideosWithLatestStats([baseVideo]);

    expect(result[0].video_id).toBe("video-1");
    expect(result[0].video_url).toBe("https://www.youtube.com/watch?v=video-1");
    expect(result[0].title).toBe("Test Video");
    expect(result[0].description).toBe("A test video");
    expect(result[0].channel_id).toBe("channel-1");
    expect(result[0].channel_title).toBe("Test Channel");
    expect(result[0].duration).toBe("PT10M30S");
    expect(result[0].tags).toEqual(["test", "video"]);
    expect(result[0].is_active).toBe(true);
  });

  it("should handle null stat values in the latest entry", () => {
    const video = {
      ...baseVideo,
      youtube_video_stats: [
        {
          view_count: null,
          like_count: null,
          comment_count: null,
          recorded_at: "2025-01-01T00:00:00Z",
        },
      ],
    };

    const result = enrichVideosWithLatestStats([video]);

    expect(result[0].latest_view_count).toBeNull();
    expect(result[0].latest_like_count).toBeNull();
    expect(result[0].latest_comment_count).toBeNull();
  });

  it("should handle null optional video fields", () => {
    const video = {
      ...baseVideo,
      description: null,
      thumbnail_url: null,
      duration: null,
      tags: null,
      comments_synced_at: null,
    };

    const result = enrichVideosWithLatestStats([video]);

    expect(result[0].description).toBeNull();
    expect(result[0].thumbnail_url).toBeNull();
    expect(result[0].duration).toBeNull();
    expect(result[0].tags).toBeNull();
    expect(result[0].comments_synced_at).toBeNull();
  });

  it("should handle multiple videos", () => {
    const videos = [
      baseVideo,
      {
        ...baseVideo,
        video_id: "video-2",
        title: "Second Video",
        youtube_video_stats: [
          {
            view_count: 2000,
            like_count: 100,
            comment_count: 20,
            recorded_at: "2025-01-02T00:00:00Z",
          },
        ],
      },
    ];

    const result = enrichVideosWithLatestStats(videos);

    expect(result).toHaveLength(2);
    expect(result[0].video_id).toBe("video-1");
    expect(result[0].latest_view_count).toBe(1000);
    expect(result[1].video_id).toBe("video-2");
    expect(result[1].latest_view_count).toBe(2000);
  });
});
