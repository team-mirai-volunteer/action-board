import { createClient } from "@supabase/supabase-js";
import { getJstRecentDates } from "@/lib/utils/date-utils";
import { adminClient } from "../utils";

const PUBLISHED_FROM = "2099-06-01T00:00:00.000Z";
const PUBLISHED_TO = "2099-07-01T00:00:00.000Z";

function videoId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

describe("動画統計の DB 集計", () => {
  const { today, yesterday, dayBeforeYesterday } = getJstRecentDates();
  const youtubeIds: string[] = [];
  const tiktokIds: string[] = [];

  afterEach(async () => {
    if (youtubeIds.length > 0) {
      await adminClient
        .from("youtube_videos")
        .delete()
        .in("video_id", youtubeIds);
      youtubeIds.length = 0;
    }
    if (tiktokIds.length > 0) {
      await adminClient
        .from("tiktok_videos")
        .delete()
        .in("video_id", tiktokIds);
      tiktokIds.length = 0;
    }
  });

  async function insertYouTube(options: {
    publishedAt: string;
    isActive?: boolean;
    stats?: Array<{
      recorded_at: string;
      view_count: number | null;
      like_count?: number | null;
      comment_count?: number | null;
    }>;
  }) {
    const id = videoId("yt-egress");
    youtubeIds.push(id);
    const { error } = await adminClient.from("youtube_videos").insert({
      video_id: id,
      title: id,
      channel_id: "channel",
      video_url: `https://example.com/${id}`,
      published_at: options.publishedAt,
      is_active: options.isActive ?? true,
    });
    if (error) throw error;

    if (options.stats && options.stats.length > 0) {
      const { error: statsError } = await adminClient
        .from("youtube_video_stats")
        .insert(
          options.stats.map((stat) => ({
            video_id: id,
            recorded_at: stat.recorded_at,
            view_count: stat.view_count,
            like_count: stat.like_count,
            comment_count: stat.comment_count,
          })),
        );
      if (statsError) throw statsError;
    }
    return id;
  }

  async function insertTikTok(options: {
    publishedAt: string;
    isActive?: boolean;
    stats?: Array<{
      recorded_at: string;
      view_count: number | null;
      like_count?: number | null;
      comment_count?: number | null;
      share_count?: number | null;
    }>;
  }) {
    const id = videoId("tt-egress");
    tiktokIds.push(id);
    const { error } = await adminClient.from("tiktok_videos").insert({
      video_id: id,
      creator_id: "creator",
      video_url: `https://example.com/${id}`,
      published_at: options.publishedAt,
      is_active: options.isActive ?? true,
    });
    if (error) throw error;

    if (options.stats && options.stats.length > 0) {
      const { data: video, error: lookupError } = await adminClient
        .from("tiktok_videos")
        .select("id")
        .eq("video_id", id)
        .single();
      if (lookupError || !video)
        throw lookupError ?? new Error("missing video");

      const { error: statsError } = await adminClient
        .from("tiktok_video_stats")
        .insert(
          options.stats.map((stat) => ({
            tiktok_video_id: video.id,
            recorded_at: stat.recorded_at,
            view_count: stat.view_count,
            like_count: stat.like_count,
            comment_count: stat.comment_count,
            share_count: stat.share_count,
          })),
        );
      if (statsError) throw statsError;
    }
    return id;
  }

  test("YouTube サマリーは最新行だけで合計し、比較日のルールを保つ", async () => {
    await insertYouTube({
      publishedAt: "2099-06-10T03:00:00.000Z",
      stats: [
        {
          recorded_at: today,
          view_count: 100,
          like_count: 9,
          comment_count: 3,
        },
        {
          recorded_at: yesterday,
          view_count: 80,
          like_count: 1,
          comment_count: 1,
        },
        {
          recorded_at: dayBeforeYesterday,
          view_count: 70,
          like_count: 1,
          comment_count: 1,
        },
      ],
    });
    await insertYouTube({
      publishedAt: "2099-06-11T00:00:00.000Z",
      stats: [
        {
          recorded_at: yesterday,
          view_count: 200,
          like_count: 4,
          comment_count: 2,
        },
        {
          recorded_at: dayBeforeYesterday,
          view_count: 150,
          like_count: 1,
          comment_count: 0,
        },
      ],
    });
    await insertYouTube({
      publishedAt: "2099-06-12T00:00:00.000Z",
      stats: [
        {
          recorded_at: "2020-01-01",
          view_count: 50,
          like_count: null,
          comment_count: null,
        },
      ],
    });
    await insertYouTube({ publishedAt: "2099-06-13T00:00:00.000Z" });
    await insertYouTube({
      publishedAt: "2099-06-14T00:00:00.000Z",
      isActive: false,
      stats: [{ recorded_at: today, view_count: 9999, like_count: 9999 }],
    });
    await insertYouTube({
      publishedAt: "2098-01-01T00:00:00.000Z",
      stats: [{ recorded_at: today, view_count: 9999, like_count: 9999 }],
    });
    await insertYouTube({
      publishedAt: "2099-06-15T00:00:00.000Z",
      stats: [
        {
          recorded_at: today,
          view_count: 100,
          like_count: null,
          comment_count: null,
        },
        { recorded_at: dayBeforeYesterday, view_count: 30, like_count: 0 },
      ],
    });
    const nullYesterdayId = await insertYouTube({
      publishedAt: "2099-06-16T00:00:00.000Z",
      stats: [
        {
          recorded_at: today,
          view_count: 100,
          like_count: 0,
          comment_count: 0,
        },
        {
          recorded_at: yesterday,
          view_count: null,
          like_count: 0,
          comment_count: 0,
        },
        { recorded_at: dayBeforeYesterday, view_count: 10, like_count: 0 },
      ],
    });

    const { data, error } = await adminClient.rpc("get_youtube_stats_summary", {
      published_from: PUBLISHED_FROM,
      published_to: PUBLISHED_TO,
    });

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    const row = data?.[0];
    expect(Number(row?.total_videos)).toBe(6);
    expect(Number(row?.total_views)).toBe(550);
    expect(Number(row?.total_likes)).toBe(13);
    expect(Number(row?.total_comments)).toBe(5);
    // 550 - (80 + 150 + 30 + 0)。昨日が NULL の動画は一昨日の 10 を使わない。
    expect(Number(row?.daily_views_increase)).toBe(290);
    expect(Number(row?.daily_videos_increase)).toBe(0);

    const history = await adminClient.rpc("get_youtube_overall_stats_history", {
      published_from: PUBLISHED_FROM,
      published_to: PUBLISHED_TO,
    });
    expect(history.error).toBeNull();
    const byDate = new Map(
      (history.data ?? []).map((item) => [item.date, item]),
    );
    expect(byDate.has(today)).toBe(false);
    expect(Number(byDate.get("2020-01-01")?.total_views)).toBe(50);
    expect(Number(byDate.get(dayBeforeYesterday)?.total_views)).toBe(260);
    expect(Number(byDate.get(yesterday)?.total_views)).toBe(280);
    expect(Number(byDate.get(yesterday)?.total_likes)).toBe(5);

    const counts = await adminClient.rpc("get_youtube_video_count_by_date", {
      published_from: PUBLISHED_FROM,
      published_to: PUBLISHED_TO,
    });
    expect(counts.error).toBeNull();
    const june10 = counts.data?.find((item) => item.date === "2099-06-10");
    expect(Number(june10?.count)).toBe(1);

    const top = await adminClient.rpc("get_youtube_videos_with_latest_stats", {
      published_from: PUBLISHED_FROM,
      published_to: PUBLISHED_TO,
      sort_by: "view_count",
      result_limit: 1,
      result_offset: 0,
    });
    expect(top.error).toBeNull();
    expect(top.data?.[0]?.latest_view_count).toBe(200);

    const second = await adminClient.rpc(
      "get_youtube_videos_with_latest_stats",
      {
        published_from: PUBLISHED_FROM,
        published_to: PUBLISHED_TO,
        sort_by: "view_count",
        result_limit: 1,
        result_offset: 1,
      },
    );
    expect(second.data?.[0]?.video_id).toBe(nullYesterdayId);

    const newest = await adminClient.rpc(
      "get_youtube_videos_with_latest_stats",
      {
        published_from: PUBLISHED_FROM,
        published_to: PUBLISHED_TO,
        sort_by: "published_at",
        result_limit: 1,
        result_offset: 0,
      },
    );
    expect(newest.data?.[0]?.video_id).toBe(nullYesterdayId);
  });

  test("今日の投稿がなければ昨日の投稿本数を日次増加にする", async () => {
    const publishedAt = new Date(`${yesterday}T03:00:00.000Z`);
    publishedAt.setTime(
      publishedAt.getTime() + Math.floor(Math.random() * 60 * 60 * 1000),
    );
    const from = publishedAt.toISOString();
    const to = new Date(publishedAt.getTime() + 1).toISOString();

    await insertYouTube({
      publishedAt: from,
      stats: [{ recorded_at: yesterday, view_count: 10, like_count: 1 }],
    });
    await insertYouTube({
      publishedAt: from,
      stats: [{ recorded_at: yesterday, view_count: 5, like_count: 1 }],
    });

    const { data, error } = await adminClient.rpc("get_youtube_stats_summary", {
      published_from: from,
      published_to: to,
    });

    expect(error).toBeNull();
    expect(Number(data?.[0]?.total_videos)).toBe(2);
    expect(Number(data?.[0]?.daily_videos_increase)).toBe(2);
    expect(Number(data?.[0]?.total_views)).toBe(15);
  });

  test("今日公開の動画だけを日次の投稿本数にする", async () => {
    const publishedAt = new Date();
    const from = publishedAt.toISOString();
    const to = new Date(publishedAt.getTime() + 1).toISOString();

    await insertYouTube({
      publishedAt: from,
      stats: [
        { recorded_at: today, view_count: 40, like_count: 1 },
        { recorded_at: yesterday, view_count: 25, like_count: 1 },
      ],
    });

    const { data, error } = await adminClient.rpc("get_youtube_stats_summary", {
      published_from: from,
      published_to: to,
    });

    expect(error).toBeNull();
    expect(Number(data?.[0]?.total_videos)).toBe(1);
    expect(Number(data?.[0]?.daily_videos_increase)).toBe(1);
    expect(Number(data?.[0]?.daily_views_increase)).toBe(15);
  });

  test("TikTok も同じ比較ルールでシェアを含めて集計する", async () => {
    await insertTikTok({
      publishedAt: "2099-06-10T03:00:00.000Z",
      stats: [
        {
          recorded_at: today,
          view_count: 100,
          like_count: 9,
          comment_count: 3,
          share_count: 4,
        },
        {
          recorded_at: yesterday,
          view_count: null,
          like_count: 1,
          comment_count: 1,
          share_count: 1,
        },
        {
          recorded_at: dayBeforeYesterday,
          view_count: 10,
          like_count: 1,
          share_count: 1,
        },
      ],
    });
    await insertTikTok({
      publishedAt: "2099-06-11T00:00:00.000Z",
      isActive: false,
      stats: [
        {
          recorded_at: today,
          view_count: 999,
          like_count: 999,
          share_count: 999,
        },
      ],
    });

    const { data, error } = await adminClient.rpc("get_tiktok_stats_summary", {
      published_from: PUBLISHED_FROM,
      published_to: PUBLISHED_TO,
    });

    expect(error).toBeNull();
    expect(Number(data?.[0]?.total_videos)).toBe(1);
    expect(Number(data?.[0]?.total_views)).toBe(100);
    expect(Number(data?.[0]?.total_likes)).toBe(9);
    expect(Number(data?.[0]?.total_comments)).toBe(3);
    expect(Number(data?.[0]?.total_shares)).toBe(4);
    expect(Number(data?.[0]?.daily_views_increase)).toBe(100);

    const history = await adminClient.rpc("get_tiktok_overall_stats_history", {
      published_from: PUBLISHED_FROM,
      published_to: PUBLISHED_TO,
    });
    expect(history.error).toBeNull();
    expect(history.data?.some((item) => item.date === today)).toBe(false);
    expect(
      Number(
        history.data?.find((item) => item.date === dayBeforeYesterday)
          ?.total_views,
      ),
    ).toBe(10);
  });

  test("対象動画が無い期間はゼロの 1 行を返す", async () => {
    const { data, error } = await adminClient.rpc("get_youtube_stats_summary", {
      published_from: "2090-01-01T00:00:00.000Z",
      published_to: "2090-01-02T00:00:00.000Z",
    });
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(Number(data?.[0]?.total_videos)).toBe(0);
    expect(Number(data?.[0]?.total_views)).toBe(0);
    expect(Number(data?.[0]?.daily_views_increase)).toBe(0);
  });

  test("anon は集計関数を実行できない", async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      throw new Error("Supabase の環境変数がありません");
    }
    const anon = createClient(url, anonKey);
    const { error } = await anon.rpc("get_youtube_stats_summary", {});
    expect(error).not.toBeNull();
  });
});
