/**
 * Supabase データベース操作
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  TikTokTokenResponse,
  TikTokUserConnection,
  TikTokVideoRecord,
  TikTokVideoStatsRecord,
} from "./types.js";

/**
 * 全てのTikTok連携ユーザーを取得する
 */
export async function fetchAllConnections(
  supabase: SupabaseClient,
): Promise<TikTokUserConnection[]> {
  const { data, error } = await supabase
    .from("tiktok_user_connections")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch connections: ${error.message}`);
  }

  return data as TikTokUserConnection[];
}

/**
 * トークンを更新する
 */
export async function updateTokens(
  supabase: SupabaseClient,
  connectionId: string,
  tokens: TikTokTokenResponse,
): Promise<void> {
  const tokenExpiresAt = new Date(
    Date.now() + tokens.expires_in * 1000,
  ).toISOString();

  const refreshTokenExpiresAt = tokens.refresh_expires_in
    ? new Date(Date.now() + tokens.refresh_expires_in * 1000).toISOString()
    : null;

  const { error } = await supabase
    .from("tiktok_user_connections")
    .update({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: tokenExpiresAt,
      refresh_token_expires_at: refreshTokenExpiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", connectionId);

  if (error) {
    throw new Error(`Failed to update tokens: ${error.message}`);
  }
}

/**
 * 動画を保存/更新する
 * @returns 動画のID（UUID）と、新規作成かどうか
 */
export async function upsertVideo(
  supabase: SupabaseClient,
  video: TikTokVideoRecord,
): Promise<{ id: string; isNew: boolean }> {
  // 既存の動画をチェック
  const { data: existing } = await supabase
    .from("tiktok_videos")
    .select("id")
    .eq("video_id", video.video_id)
    .maybeSingle();

  if (existing) {
    // 既存の動画がある場合は更新
    const { error } = await supabase
      .from("tiktok_videos")
      .update({
        title: video.title,
        description: video.description,
        thumbnail_url: video.thumbnail_url,
        duration: video.duration,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) {
      throw new Error(`Failed to update video: ${error.message}`);
    }

    return { id: existing.id, isNew: false };
  }

  // 新規動画を挿入
  const { data, error } = await supabase
    .from("tiktok_videos")
    .insert({
      video_id: video.video_id,
      user_id: video.user_id,
      creator_id: video.creator_id,
      creator_username: video.creator_username,
      title: video.title,
      description: video.description,
      thumbnail_url: video.thumbnail_url,
      video_url: video.video_url,
      published_at: video.published_at,
      duration: video.duration,
      tags: video.tags,
      is_active: video.is_active,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to insert video: ${error.message}`);
  }

  return { id: data.id, isNew: true };
}

/**
 * 動画統計を保存/更新する（1日1レコード）
 */
export async function upsertStats(
  supabase: SupabaseClient,
  stats: TikTokVideoStatsRecord,
): Promise<void> {
  // 今日の統計が既にあるかチェック
  const { data: existing } = await supabase
    .from("tiktok_video_stats")
    .select("id")
    .eq("tiktok_video_id", stats.tiktok_video_id)
    .eq("recorded_at", stats.recorded_at)
    .maybeSingle();

  if (existing) {
    // 既存の統計を更新
    const { error } = await supabase
      .from("tiktok_video_stats")
      .update({
        view_count: stats.view_count,
        like_count: stats.like_count,
        comment_count: stats.comment_count,
        share_count: stats.share_count,
      })
      .eq("id", existing.id);

    if (error) {
      throw new Error(`Failed to update stats: ${error.message}`);
    }

    return;
  }

  // 新規統計を挿入
  const { error } = await supabase.from("tiktok_video_stats").insert({
    tiktok_video_id: stats.tiktok_video_id,
    recorded_at: stats.recorded_at,
    view_count: stats.view_count,
    like_count: stats.like_count,
    comment_count: stats.comment_count,
    share_count: stats.share_count,
  });

  if (error) {
    throw new Error(`Failed to insert stats: ${error.message}`);
  }
}
