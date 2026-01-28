import type { SupabaseClient } from "@supabase/supabase-js";

export interface YouTubeUserConnection {
  user_id: string;
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
}

export interface YouTubeVideoLikeRecord {
  user_id: string;
  video_id: string;
  youtube_video_id?: string | null;
  is_team_mirai_video: boolean;
}

export interface ExistingYouTubeVideo {
  id: string;
  video_id: string;
}

/**
 * 全てのYouTube連携ユーザーを取得
 */
export async function fetchAllYouTubeConnections(
  supabase: SupabaseClient,
): Promise<YouTubeUserConnection[]> {
  const { data, error } = await supabase
    .from("youtube_user_connections")
    .select("user_id, access_token, refresh_token, token_expires_at");

  if (error) {
    throw new Error(`Failed to fetch YouTube connections: ${error.message}`);
  }

  return data || [];
}

/**
 * ユーザーのアクセストークンを更新
 */
export async function updateUserAccessToken(
  supabase: SupabaseClient,
  userId: string,
  accessToken: string,
  refreshToken: string,
  expiresAt: string,
): Promise<void> {
  const { error } = await supabase
    .from("youtube_user_connections")
    .update({
      access_token: accessToken,
      refresh_token: refreshToken,
      token_expires_at: expiresAt,
    })
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to update access token: ${error.message}`);
  }
}

/**
 * ユーザーが既にいいね済みの動画IDを取得
 */
export async function fetchUserLikedVideoIds(
  supabase: SupabaseClient,
  userId: string,
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("youtube_video_likes")
    .select("video_id")
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to fetch liked video IDs: ${error.message}`);
  }

  return new Set((data || []).map((d) => d.video_id));
}

/**
 * チームみらい動画のvideo_id一覧を取得
 */
export async function fetchTeamMiraiVideoIds(
  supabase: SupabaseClient,
): Promise<Map<string, string>> {
  const { data, error } = await supabase
    .from("youtube_videos")
    .select("id, video_id")
    .eq("is_active", true);

  if (error) {
    throw new Error(`Failed to fetch team mirai videos: ${error.message}`);
  }

  const map = new Map<string, string>();
  for (const video of data || []) {
    map.set(video.video_id, video.id);
  }
  return map;
}

/**
 * YouTubeいいねミッションのIDを取得
 */
export async function getYouTubeLikeMissionId(
  supabase: SupabaseClient,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("missions")
    .select("id")
    .eq("slug", "youtube-like")
    .single();

  if (error || !data) {
    return null;
  }

  return data.id;
}

/**
 * 現在のシーズンIDを取得
 */
export async function getCurrentSeasonId(
  supabase: SupabaseClient,
): Promise<string | null> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("seasons")
    .select("id")
    .lte("start_date", now)
    .gte("end_date", now)
    .single();

  if (error || !data) {
    return null;
  }

  return data.id;
}

/**
 * YouTubeいいね達成を記録
 */
export async function recordYouTubeLikeAchievement(
  supabase: SupabaseClient,
  userId: string,
  missionId: string,
  seasonId: string | null,
  videoId: string,
  youtubeVideoId: string | null,
): Promise<boolean> {
  // 1. achievementを作成
  const { data: achievement, error: achievementError } = await supabase
    .from("achievements")
    .insert({
      mission_id: missionId,
      user_id: userId,
      season_id: seasonId,
    })
    .select("id")
    .single();

  if (achievementError) {
    console.error(
      `Failed to create achievement for user ${userId}:`,
      achievementError,
    );
    return false;
  }

  // 2. mission_artifactsを作成
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const { error: artifactError } = await supabase
    .from("mission_artifacts")
    .insert({
      user_id: userId,
      achievement_id: achievement.id,
      artifact_type: "YOUTUBE_LIKE",
      link_url: videoUrl,
    });

  if (artifactError) {
    console.error(
      `Failed to create artifact for user ${userId}:`,
      artifactError,
    );
  }

  // 3. youtube_video_likesに記録
  const { error: likeError } = await supabase
    .from("youtube_video_likes")
    .insert({
      user_id: userId,
      video_id: videoId,
      youtube_video_id: youtubeVideoId,
      is_team_mirai_video: true,
    });

  if (likeError) {
    console.error(`Failed to record like for user ${userId}:`, likeError);
  }

  return true;
}
