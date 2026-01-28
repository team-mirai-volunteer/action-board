import "server-only";

import { createAdminClient } from "@/lib/supabase/adminClient";
import type { YouTubeVideoDetail } from "./youtube-client";
import {
  fetchChannelInfo,
  fetchUserUploadedVideos,
  fetchVideoDetails,
} from "./youtube-client";

// #チームみらい を検出する正規表現
const TEAM_MIRAI_REGEX = /#(チームみらい|teammirai)/i;

/**
 * YouTube同期結果
 */
export interface YouTubeSyncResult {
  success: boolean;
  syncedCount?: number;
  skippedCount?: number;
  error?: string;
}

/**
 * #チームみらい 動画をフィルタリングする
 */
export function filterTeamMiraiVideos(
  videos: YouTubeVideoDetail[],
): YouTubeVideoDetail[] {
  return videos.filter((video) => {
    const description = video.snippet.description || "";
    const title = video.snippet.title || "";
    const tags = video.snippet.tags || [];

    return (
      TEAM_MIRAI_REGEX.test(description) ||
      TEAM_MIRAI_REGEX.test(title) ||
      tags.some((tag) => TEAM_MIRAI_REGEX.test(tag))
    );
  });
}

/**
 * テキストからハッシュタグを抽出する
 */
function extractHashtags(text: string): string[] {
  const matches = text.match(/#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+/g);
  return matches || [];
}

/**
 * YouTube動画をDBに保存する（upsert）
 * @returns video_id（PRIMARY KEY）
 */
export async function saveYouTubeVideo(
  video: YouTubeVideoDetail,
): Promise<string | null> {
  const supabase = await createAdminClient();

  const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;
  const tags = [
    ...extractHashtags(video.snippet.description || ""),
    ...(video.snippet.tags || []),
  ];
  // 重複を除去
  const uniqueTags = Array.from(new Set(tags));

  const videoData = {
    video_id: video.id,
    video_url: videoUrl,
    title: video.snippet.title,
    description: video.snippet.description || null,
    thumbnail_url:
      video.snippet.thumbnails.high?.url ||
      video.snippet.thumbnails.medium?.url ||
      video.snippet.thumbnails.default?.url ||
      null,
    channel_id: video.snippet.channelId,
    channel_title: video.snippet.channelTitle || null,
    published_at: video.snippet.publishedAt || null,
    duration: video.contentDetails.duration || null,
    tags: uniqueTags.length > 0 ? uniqueTags : null,
    is_active: true,
    updated_at: new Date().toISOString(),
  };

  // video_idでupsert（video_idがPRIMARY KEY）
  const { error } = await supabase.from("youtube_videos").upsert(videoData, {
    onConflict: "video_id",
  });

  if (error) {
    console.error("Failed to save YouTube video:", error);
    return null;
  }

  return video.id; // video_idがPRIMARY KEY
}

/**
 * YouTube動画の統計情報を保存する
 * @param videoId - YouTube動画ID（youtube_videos.video_idへの外部キー）
 */
export async function saveYouTubeVideoStats(
  videoId: string,
  video: YouTubeVideoDetail,
): Promise<boolean> {
  const supabase = await createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  const statsData = {
    video_id: videoId,
    recorded_at: today,
    view_count: video.statistics.viewCount
      ? Number.parseInt(video.statistics.viewCount, 10)
      : null,
    like_count: video.statistics.likeCount
      ? Number.parseInt(video.statistics.likeCount, 10)
      : null,
    comment_count: video.statistics.commentCount
      ? Number.parseInt(video.statistics.commentCount, 10)
      : null,
  };

  // video_id と recorded_at でupsert
  const { error } = await supabase
    .from("youtube_video_stats")
    .upsert(statsData, {
      onConflict: "video_id,recorded_at",
    });

  if (error) {
    console.error("Failed to save YouTube video stats:", error);
    return false;
  }

  return true;
}

/**
 * ユーザーのYouTube動画を同期する
 */
export async function syncUserYouTubeVideos(
  accessToken: string,
  maxResults = 100,
): Promise<YouTubeSyncResult> {
  try {
    // 1. チャンネル情報を取得（アップロードプレイリストID含む）
    const channel = await fetchChannelInfo(accessToken);

    if (!channel.uploadsPlaylistId) {
      return {
        success: false,
        error: "アップロードプレイリストが見つかりません",
      };
    }

    // 2. アップロード動画のIDを取得
    const videoIds = await fetchUserUploadedVideos(
      accessToken,
      channel.uploadsPlaylistId,
      maxResults,
    );

    if (videoIds.length === 0) {
      return {
        success: true,
        syncedCount: 0,
        skippedCount: 0,
      };
    }

    // 3. 動画の詳細情報を取得
    const videoDetails = await fetchVideoDetails(accessToken, videoIds);

    // 4. #チームみらい 動画をフィルタリング
    const teamMiraiVideos = filterTeamMiraiVideos(videoDetails);

    let syncedCount = 0;
    let skippedCount = 0;

    // 5. 動画と統計を保存
    for (const video of teamMiraiVideos) {
      const savedId = await saveYouTubeVideo(video);

      if (savedId) {
        await saveYouTubeVideoStats(savedId, video);
        syncedCount++;
      } else {
        skippedCount++;
      }
    }

    return {
      success: true,
      syncedCount,
      skippedCount,
    };
  } catch (error) {
    console.error("YouTube sync error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "YouTube動画の同期に失敗しました",
    };
  }
}
