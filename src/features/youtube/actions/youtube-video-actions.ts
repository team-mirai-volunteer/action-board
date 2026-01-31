"use server";

import { createAdminClient } from "@/lib/supabase/adminClient";
import { createClient } from "@/lib/supabase/client";
import {
  type YouTubeSyncResult,
  syncUserYouTubeVideos,
} from "../services/youtube-video-service";
import type { YouTubeLinkStatus, YouTubeVideoWithStats } from "../types";
import { refreshYouTubeTokenAction } from "./youtube-auth-actions";

/**
 * YouTube連携状態を取得するServer Action
 */
export async function getYouTubeLinkStatusAction(): Promise<YouTubeLinkStatus> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        isLinked: false,
      };
    }

    // youtube_user_connectionsテーブルから連携状態を取得
    const adminClient = await createAdminClient();
    const { data: connection, error } = await adminClient
      .from("youtube_user_connections")
      .select("channel_id, display_name, avatar_url, created_at")
      .eq("user_id", user.id)
      .single();

    if (error || !connection) {
      return {
        isLinked: false,
      };
    }

    return {
      isLinked: true,
      channelId: connection.channel_id ?? undefined,
      channelTitle: connection.display_name ?? undefined,
      thumbnailUrl: connection.avatar_url ?? undefined,
      linkedAt: connection.created_at ?? undefined,
    };
  } catch (error) {
    console.error("Get YouTube link status error:", error);
    return {
      isLinked: false,
    };
  }
}

/**
 * 現在のユーザーのアップロード動画一覧を取得するServer Action
 * youtube_videosテーブルとchannel_idでJOINして取得
 */
export async function getMyUploadedVideosAction(
  limit = 20,
  offset = 0,
): Promise<{
  success: boolean;
  videos?: YouTubeVideoWithStats[];
  total?: number;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "ログインが必要です",
      };
    }

    // youtube_user_connectionsからchannel_idを取得
    const adminClient = await createAdminClient();
    const { data: connection, error: connectionError } = await adminClient
      .from("youtube_user_connections")
      .select("channel_id")
      .eq("user_id", user.id)
      .single();

    if (connectionError || !connection?.channel_id) {
      return {
        success: false,
        error: "YouTubeアカウントが連携されていません",
      };
    }

    // youtube_videosテーブルからchannel_idが一致する動画を取得
    const { data: videos, error: videosError } = await supabase
      .from("youtube_videos")
      .select(
        `
        *,
        youtube_video_stats(
          view_count,
          like_count,
          comment_count,
          recorded_at
        )
      `,
      )
      .eq("channel_id", connection.channel_id)
      .eq("is_active", true)
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (videosError) {
      console.error("Failed to fetch uploaded videos:", videosError);
      return {
        success: false,
        error: "動画の取得に失敗しました",
      };
    }

    // 総数を取得
    const { count, error: countError } = await supabase
      .from("youtube_videos")
      .select("*", { count: "exact", head: true })
      .eq("channel_id", connection.channel_id)
      .eq("is_active", true);

    if (countError) {
      console.error("Failed to fetch video count:", countError);
    }

    // 各動画の最新統計を整形
    const videosWithStats: YouTubeVideoWithStats[] = (videos || []).map(
      (video) => {
        const stats = video.youtube_video_stats as Array<{
          view_count: number | null;
          like_count: number | null;
          comment_count: number | null;
          recorded_at: string;
        }>;

        // 最新の統計を取得
        const latestStats = stats?.sort(
          (a, b) =>
            new Date(b.recorded_at).getTime() -
            new Date(a.recorded_at).getTime(),
        )[0];

        return {
          video_id: video.video_id,
          video_url: video.video_url,
          title: video.title,
          description: video.description,
          thumbnail_url: video.thumbnail_url,
          channel_id: video.channel_id,
          channel_title: video.channel_title,
          published_at: video.published_at,
          duration: video.duration,
          tags: video.tags,
          is_active: video.is_active,
          created_at: video.created_at,
          updated_at: video.updated_at,
          comments_synced_at: video.comments_synced_at,
          latest_view_count: latestStats?.view_count ?? null,
          latest_like_count: latestStats?.like_count ?? null,
          latest_comment_count: latestStats?.comment_count ?? null,
        };
      },
    );

    return {
      success: true,
      videos: videosWithStats,
      total: count ?? 0,
    };
  } catch (error) {
    console.error("Get uploaded videos action error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "動画の取得に失敗しました",
    };
  }
}

/**
 * 現在のユーザーのYouTube動画を同期するServer Action
 * ユーザー自身のアップロード動画は即時同期（レート制限なし）
 */
export async function syncMyYouTubeVideosAction(): Promise<YouTubeSyncResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "ログインが必要です",
      };
    }

    // YouTube連携情報をテーブルから取得
    const adminClient = await createAdminClient();
    const { data: connection, error: connectionError } = await adminClient
      .from("youtube_user_connections")
      .select("access_token, token_expires_at, refresh_token")
      .eq("user_id", user.id)
      .single();

    if (connectionError || !connection) {
      return {
        success: false,
        error: "YouTubeアカウントが連携されていません",
      };
    }

    let accessToken = connection.access_token;

    // トークンの有効期限をチェック
    if (new Date(connection.token_expires_at) < new Date()) {
      // トークンが期限切れの場合、リフレッシュを試みる
      console.log("YouTube access token expired, attempting refresh...");
      const refreshResult = await refreshYouTubeTokenAction();

      if (!refreshResult.success || !refreshResult.accessToken) {
        return {
          success: false,
          error:
            "YouTubeのアクセストークンが期限切れです。再度連携してください。",
        };
      }

      accessToken = refreshResult.accessToken;
    }

    // 動画を同期
    const result = await syncUserYouTubeVideos(accessToken);

    return result;
  } catch (error) {
    console.error("Sync YouTube videos action error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "YouTube動画の同期に失敗しました",
    };
  }
}

/**
 * チームみらい動画結果
 */
export interface TeamMiraiVideoSyncResult {
  success: boolean;
  newVideos?: number;
  skipped?: boolean;
  error?: string;
}

/**
 * #チームみらい タグ付き動画を全体同期するServer Action
 * 最終同期から2時間経過していない場合はスキップ（search.list APIは100ユニット/回と高コスト）
 */
export async function syncTeamMiraiVideosAction(): Promise<TeamMiraiVideoSyncResult> {
  try {
    const adminClient = await createAdminClient();

    // 2時間のレート制限チェック（全ユーザー共通）
    const { data: syncStatus } = await adminClient
      .from("youtube_sync_status")
      .select("last_synced_at")
      .eq("id", "videos")
      .single();

    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const lastSyncedAt = syncStatus?.last_synced_at
      ? new Date(syncStatus.last_synced_at)
      : null;

    if (lastSyncedAt && lastSyncedAt > twoHoursAgo) {
      // 2時間以内に同期済み → スキップ
      return {
        success: true,
        newVideos: 0,
        skipped: true,
      };
    }

    // #チームみらい 動画を同期
    const { syncYouTubeVideos } = await import(
      "../services/youtube-video-sync-service"
    );

    const result = await syncYouTubeVideos({
      maxResults: 50, // 最新50件を検索
    });

    // 同期成功時は全体共通の last_synced_at を更新
    await adminClient
      .from("youtube_sync_status")
      .update({
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", "videos");

    return {
      success: true,
      newVideos: result.newVideos,
    };
  } catch (error) {
    console.error("Sync team mirai videos error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "チームみらい動画の同期に失敗しました",
    };
  }
}
