import "server-only";

import { createAdminClient } from "@/lib/supabase/adminClient";
import { createClient } from "@/lib/supabase/client";
import type {
  TikTokSyncResult,
  TikTokVideo,
  TikTokVideoFromAPI,
  TikTokVideoListResponse,
  TikTokVideoStats,
} from "../types";

// NOTE: tiktok_videos, tiktok_video_stats テーブルの型は
// マイグレーション適用後に `npm run types` で生成される
// それまでは を使用して型エラーを回避

// #チームみらい を検出する正規表現
const TEAM_MIRAI_REGEX = /#(チームみらい|teammirai)/i;

/**
 * TikTok APIからユーザーの動画一覧を取得する
 */
export async function fetchTikTokVideosFromAPI(
  accessToken: string,
  cursor?: number,
): Promise<{ videos: TikTokVideoFromAPI[]; hasMore: boolean; cursor: number }> {
  const fields = [
    "id",
    "create_time",
    "cover_image_url",
    "share_url",
    "video_description",
    "duration",
    "title",
    "like_count",
    "comment_count",
    "share_count",
    "view_count",
  ].join(",");

  const url = new URL("https://open.tiktokapis.com/v2/video/list/");
  url.searchParams.set("fields", fields);

  const body: Record<string, number> = {
    max_count: 20,
  };
  if (cursor) {
    body.cursor = cursor;
  }

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("TikTok video list fetch failed:", errorText);
    throw new Error("TikTok動画一覧の取得に失敗しました");
  }

  const data: TikTokVideoListResponse = await response.json();

  if (data.error?.code && data.error.code !== "ok") {
    console.error("TikTok API error:", data.error);
    throw new Error(`TikTok APIエラー: ${data.error.message}`);
  }

  return {
    videos: data.data.videos || [],
    hasMore: data.data.has_more,
    cursor: data.data.cursor,
  };
}

/**
 * #チームみらい 動画をフィルタリングする
 */
export function filterTeamMiraiVideos(
  videos: TikTokVideoFromAPI[],
): TikTokVideoFromAPI[] {
  return videos.filter((video) => {
    const description = video.video_description || "";
    const title = video.title || "";
    return TEAM_MIRAI_REGEX.test(description) || TEAM_MIRAI_REGEX.test(title);
  });
}

/**
 * TikTok動画をDBに保存する（service_role使用）
 */
export async function saveTikTokVideo(
  video: TikTokVideoFromAPI,
  userId: string,
  creatorId: string,
  creatorUsername?: string,
): Promise<TikTokVideo | null> {
  const supabase = await createAdminClient();

  // 既存の動画をチェック
  const { data: existing } = await supabase
    .from("tiktok_videos")
    .select("id")
    .eq("video_id", video.id)
    .maybeSingle();

  if (existing) {
    // 既存の動画がある場合は更新
    const { data, error } = await supabase
      .from("tiktok_videos")
      .update({
        title: video.title || null,
        description: video.video_description || null,
        thumbnail_url: video.cover_image_url || null,
        duration: video.duration || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      console.error("Failed to update TikTok video:", error);
      return null;
    }

    return data as TikTokVideo;
  }

  // 新規動画を挿入
  const { data, error } = await supabase
    .from("tiktok_videos")
    .insert({
      video_id: video.id,
      user_id: userId,
      creator_id: creatorId,
      creator_username: creatorUsername || null,
      title: video.title || null,
      description: video.video_description || null,
      thumbnail_url: video.cover_image_url || null,
      video_url: video.share_url,
      published_at: video.create_time
        ? new Date(video.create_time * 1000).toISOString()
        : null,
      duration: video.duration || null,
      tags: extractHashtags(video.video_description || ""),
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to save TikTok video:", error);
    return null;
  }

  return data as TikTokVideo;
}

/**
 * TikTok動画の統計情報を保存する（service_role使用）
 */
export async function saveTikTokVideoStats(
  tiktokVideoId: string,
  video: TikTokVideoFromAPI,
): Promise<TikTokVideoStats | null> {
  const supabase = await createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  // 今日の統計が既にあるかチェック
  const { data: existing } = await supabase
    .from("tiktok_video_stats")
    .select("id")
    .eq("tiktok_video_id", tiktokVideoId)
    .eq("recorded_at", today)
    .maybeSingle();

  if (existing) {
    // 既存の統計を更新
    const { data, error } = await supabase
      .from("tiktok_video_stats")
      .update({
        view_count: video.view_count ?? null,
        like_count: video.like_count ?? null,
        comment_count: video.comment_count ?? null,
        share_count: video.share_count ?? null,
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      console.error("Failed to update TikTok video stats:", error);
      return null;
    }

    return data as TikTokVideoStats;
  }

  // 新規統計を挿入
  const { data, error } = await supabase
    .from("tiktok_video_stats")
    .insert({
      tiktok_video_id: tiktokVideoId,
      recorded_at: today,
      view_count: video.view_count ?? null,
      like_count: video.like_count ?? null,
      comment_count: video.comment_count ?? null,
      share_count: video.share_count ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to save TikTok video stats:", error);
    return null;
  }

  return data as TikTokVideoStats;
}

/**
 * ユーザーのTikTok動画を同期する
 */
export async function syncUserTikTokVideos(
  userId: string,
  accessToken: string,
  tiktokOpenId: string,
  tiktokUsername?: string,
): Promise<TikTokSyncResult> {
  try {
    let syncedCount = 0;
    let skippedCount = 0;
    let cursor: number | undefined;
    let hasMore = true;

    // ページネーションで全動画を取得
    while (hasMore) {
      const result = await fetchTikTokVideosFromAPI(accessToken, cursor);
      const teamMiraiVideos = filterTeamMiraiVideos(result.videos);

      for (const video of teamMiraiVideos) {
        const savedVideo = await saveTikTokVideo(
          video,
          userId,
          tiktokOpenId,
          tiktokUsername,
        );

        if (savedVideo) {
          // 統計情報も保存
          await saveTikTokVideoStats(savedVideo.id, video);
          syncedCount++;
        } else {
          skippedCount++;
        }
      }

      // 次のページがなければ終了
      hasMore = result.hasMore;
      cursor = result.cursor;

      // レート制限対策のためウェイト（100msほど）
      if (hasMore) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return {
      success: true,
      syncedCount,
      skippedCount,
    };
  } catch (error) {
    console.error("TikTok sync error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "TikTok動画の同期に失敗しました",
    };
  }
}

interface VideoWithStats {
  id: string;
  video_id: string;
  user_id: string | null;
  creator_id: string;
  creator_username: string | null;
  title: string | null;
  description: string | null;
  thumbnail_url: string | null;
  video_url: string;
  published_at: string | null;
  duration: number | null;
  tags: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  tiktok_video_stats: Array<{
    view_count: number | null;
    like_count: number | null;
    comment_count: number | null;
    share_count: number | null;
    recorded_at: string;
  }>;
}

/**
 * DBからTikTok動画一覧を取得する（最新統計付き）
 */
export async function getTikTokVideosWithStats(
  limit = 20,
  offset = 0,
  sortBy: "published_at" | "view_count" | "like_count" = "published_at",
): Promise<(TikTokVideo & { latest_stats?: TikTokVideoStats })[]> {
  const supabase = createClient();
  const { data: videos, error } = await supabase
    .from("tiktok_videos")
    .select(
      `
      *,
      tiktok_video_stats(
        view_count,
        like_count,
        comment_count,
        share_count,
        recorded_at
      )
    `,
    )
    .eq("is_active", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch TikTok videos:", error);
    return [];
  }

  // 各動画の最新統計を取得
  const videosWithStats = ((videos || []) as VideoWithStats[]).map((video) => {
    const stats = video.tiktok_video_stats || [];

    const latestStats = stats.sort(
      (a, b) =>
        new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime(),
    )[0];

    return {
      ...video,
      tiktok_video_stats: undefined,
      latest_stats: latestStats
        ? {
            id: "",
            tiktok_video_id: video.id,
            recorded_at: latestStats.recorded_at,
            view_count: latestStats.view_count,
            like_count: latestStats.like_count,
            comment_count: latestStats.comment_count,
            share_count: latestStats.share_count,
            created_at: "",
          }
        : undefined,
    } as TikTokVideo & { latest_stats?: TikTokVideoStats };
  });

  // ソート
  const sorted = videosWithStats.sort((a, b) => {
    switch (sortBy) {
      case "view_count":
        return (
          (b.latest_stats?.view_count ?? 0) - (a.latest_stats?.view_count ?? 0)
        );
      case "like_count":
        return (
          (b.latest_stats?.like_count ?? 0) - (a.latest_stats?.like_count ?? 0)
        );
      default:
        return (
          new Date(b.published_at ?? 0).getTime() -
          new Date(a.published_at ?? 0).getTime()
        );
    }
  });

  return sorted.slice(offset, offset + limit);
}

/**
 * ユーザーのTikTok動画一覧を取得する
 */
export async function getUserTikTokVideos(
  userId: string,
  limit = 20,
  offset = 0,
): Promise<(TikTokVideo & { latest_stats?: TikTokVideoStats })[]> {
  const supabase = createClient();
  const { data: videos, error } = await supabase
    .from("tiktok_videos")
    .select(
      `
      *,
      tiktok_video_stats(
        view_count,
        like_count,
        comment_count,
        share_count,
        recorded_at
      )
    `,
    )
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Failed to fetch user TikTok videos:", error);
    return [];
  }

  // 各動画の最新統計を取得
  return ((videos || []) as VideoWithStats[]).map((video) => {
    const stats = video.tiktok_video_stats || [];

    const latestStats = stats.sort(
      (a, b) =>
        new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime(),
    )[0];

    return {
      ...video,
      tiktok_video_stats: undefined,
      latest_stats: latestStats
        ? {
            id: "",
            tiktok_video_id: video.id,
            recorded_at: latestStats.recorded_at,
            view_count: latestStats.view_count,
            like_count: latestStats.like_count,
            comment_count: latestStats.comment_count,
            share_count: latestStats.share_count,
            created_at: "",
          }
        : undefined,
    } as TikTokVideo & { latest_stats?: TikTokVideoStats };
  });
}

/**
 * TikTok動画の総数を取得する
 */
export async function getTikTokVideoCount(): Promise<number> {
  const supabase = createClient();
  const { count, error } = await supabase
    .from("tiktok_videos")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  if (error) {
    console.error("Failed to fetch TikTok video count:", error);
    return 0;
  }

  return count || 0;
}

/**
 * テキストからハッシュタグを抽出する
 */
function extractHashtags(text: string): string[] {
  const matches = text.match(/#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+/g);
  return matches || [];
}
