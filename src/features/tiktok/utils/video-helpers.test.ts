import type { TikTokVideo, TikTokVideoStats } from "../types";
import {
  attachLatestStats,
  formatDateToYMD,
  sortTikTokVideos,
  type VideoWithStats,
} from "./video-helpers";

function createVideoWithStats(
  overrides: Partial<VideoWithStats> = {},
): VideoWithStats {
  return {
    id: "vid-1",
    video_id: "tiktok-123",
    user_id: "user-1",
    creator_id: "creator-1",
    creator_username: "testuser",
    title: "Test Video",
    description: "A test video",
    thumbnail_url: "https://example.com/thumb.jpg",
    video_url: "https://example.com/video.mp4",
    published_at: "2025-01-15T10:00:00Z",
    duration: 60,
    tags: ["test"],
    is_active: true,
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-15T10:00:00Z",
    tiktok_video_stats: [],
    ...overrides,
  };
}

describe("attachLatestStats", () => {
  it("統計データがない場合、latest_statsがundefinedになる", () => {
    const video = createVideoWithStats({ tiktok_video_stats: [] });
    const result = attachLatestStats(video);

    expect(result.latest_stats).toBeUndefined();
    expect(result.id).toBe("vid-1");
    expect(result.video_id).toBe("tiktok-123");
  });

  it("統計データがある場合、最新のものをlatest_statsに付与する", () => {
    const video = createVideoWithStats({
      tiktok_video_stats: [
        {
          view_count: 100,
          like_count: 10,
          comment_count: 5,
          share_count: 2,
          recorded_at: "2025-01-14",
        },
        {
          view_count: 200,
          like_count: 20,
          comment_count: 8,
          share_count: 3,
          recorded_at: "2025-01-15",
        },
      ],
    });

    const result = attachLatestStats(video);

    expect(result.latest_stats).toBeDefined();
    expect(result.latest_stats?.view_count).toBe(200);
    expect(result.latest_stats?.like_count).toBe(20);
    expect(result.latest_stats?.comment_count).toBe(8);
    expect(result.latest_stats?.share_count).toBe(3);
    expect(result.latest_stats?.tiktok_video_id).toBe("vid-1");
  });

  it("latest_statsのidとcreated_atは空文字が設定される", () => {
    const video = createVideoWithStats({
      tiktok_video_stats: [
        {
          view_count: 100,
          like_count: 10,
          comment_count: 5,
          share_count: 2,
          recorded_at: "2025-01-15",
        },
      ],
    });

    const result = attachLatestStats(video);

    expect(result.latest_stats?.id).toBe("");
    expect(result.latest_stats?.created_at).toBe("");
  });
});

describe("sortTikTokVideos", () => {
  function createVideoResult(
    overrides: Partial<TikTokVideo & { latest_stats?: TikTokVideoStats }> = {},
  ): TikTokVideo & { latest_stats?: TikTokVideoStats } {
    return {
      id: "vid-1",
      video_id: "tiktok-123",
      user_id: "user-1",
      creator_id: "creator-1",
      creator_username: "testuser",
      title: "Test",
      description: null,
      thumbnail_url: null,
      video_url: "https://example.com/video.mp4",
      published_at: "2025-01-15T10:00:00Z",
      duration: 60,
      tags: null,
      is_active: true,
      created_at: "2025-01-15T10:00:00Z",
      updated_at: "2025-01-15T10:00:00Z",
      ...overrides,
    };
  }

  const videos = [
    createVideoResult({
      id: "a",
      published_at: "2025-01-10T10:00:00Z",
      latest_stats: {
        id: "",
        tiktok_video_id: "a",
        recorded_at: "2025-01-15",
        view_count: 300,
        like_count: 5,
        comment_count: 0,
        share_count: 0,
        created_at: "",
      },
    }),
    createVideoResult({
      id: "b",
      published_at: "2025-01-15T10:00:00Z",
      latest_stats: {
        id: "",
        tiktok_video_id: "b",
        recorded_at: "2025-01-15",
        view_count: 100,
        like_count: 50,
        comment_count: 0,
        share_count: 0,
        created_at: "",
      },
    }),
    createVideoResult({
      id: "c",
      published_at: "2025-01-12T10:00:00Z",
      latest_stats: {
        id: "",
        tiktok_video_id: "c",
        recorded_at: "2025-01-15",
        view_count: 200,
        like_count: 20,
        comment_count: 0,
        share_count: 0,
        created_at: "",
      },
    }),
  ];

  it("view_countでソートできる", () => {
    const sorted = sortTikTokVideos(videos, "view_count");
    expect(sorted.map((v) => v.id)).toEqual(["a", "c", "b"]);
  });

  it("like_countでソートできる", () => {
    const sorted = sortTikTokVideos(videos, "like_count");
    expect(sorted.map((v) => v.id)).toEqual(["b", "c", "a"]);
  });

  it("published_atでソートできる（デフォルト: 新しい順）", () => {
    const sorted = sortTikTokVideos(videos, "published_at");
    expect(sorted.map((v) => v.id)).toEqual(["b", "c", "a"]);
  });

  it("元の配列を変更しない", () => {
    const original = [...videos];
    sortTikTokVideos(videos, "view_count");
    expect(videos.map((v) => v.id)).toEqual(original.map((v) => v.id));
  });

  it("latest_statsがnullの場合は0として扱う", () => {
    const videosWithNull = [
      createVideoResult({ id: "x", latest_stats: undefined }),
      createVideoResult({
        id: "y",
        latest_stats: {
          id: "",
          tiktok_video_id: "y",
          recorded_at: "2025-01-15",
          view_count: 100,
          like_count: 10,
          comment_count: 0,
          share_count: 0,
          created_at: "",
        },
      }),
    ];

    const sorted = sortTikTokVideos(videosWithNull, "view_count");
    expect(sorted[0].id).toBe("y");
    expect(sorted[1].id).toBe("x");
  });
});

describe("formatDateToYMD", () => {
  it("DateオブジェクトをYYYY-MM-DD形式にフォーマットする", () => {
    const date = new Date("2025-03-15T10:30:00Z");
    expect(formatDateToYMD(date)).toBe("2025-03-15");
  });

  it("月初をフォーマットできる", () => {
    const date = new Date("2025-01-01T00:00:00Z");
    expect(formatDateToYMD(date)).toBe("2025-01-01");
  });

  it("年末をフォーマットできる", () => {
    const date = new Date("2025-12-31T23:59:59Z");
    expect(formatDateToYMD(date)).toBe("2025-12-31");
  });
});
