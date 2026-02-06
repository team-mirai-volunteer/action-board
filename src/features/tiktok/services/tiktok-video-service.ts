import "server-only";

import { createAdminClient } from "@/lib/supabase/adminClient";
import { createClient } from "@/lib/supabase/client";
import type {
  TikTokSyncResult,
  TikTokVideo,
  TikTokVideoFromAPI,
  TikTokVideoStats,
} from "../types";
import {
  buildTikTokVideoInsertData,
  buildTikTokVideoUpdateData,
} from "../utils/data-builders";
import { filterTeamMiraiVideos } from "../utils/video-filters";
import {
  attachLatestStats,
  formatDateToYMD,
  sortTikTokVideos,
  type VideoWithStats,
} from "../utils/video-helpers";
import { fetchVideoList } from "./tiktok-client";

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
      .update(buildTikTokVideoUpdateData(video))
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
    .insert(
      buildTikTokVideoInsertData(video, userId, creatorId, creatorUsername),
    )
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
  const today = formatDateToYMD(new Date());

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
      const result = await fetchVideoList(accessToken, cursor);
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
  const videosWithStats = ((videos || []) as VideoWithStats[]).map(
    attachLatestStats,
  );

  // ソート
  const sorted = sortTikTokVideos(videosWithStats, sortBy);

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
  return ((videos || []) as VideoWithStats[]).map(attachLatestStats);
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
