import type {
  TikTokTokenResponse,
  TikTokUser,
  TikTokVideoFromAPI,
} from "../types";

/**
 * テキストからハッシュタグを抽出する
 */
function extractHashtags(text: string): string[] {
  const matches = text.match(/#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+/g);
  return matches || [];
}

/**
 * TikTokTokenResponseとTikTokUserからDB upsert用オブジェクトを構築する
 */
export function buildTikTokConnectionUpsertData(
  userId: string,
  tokens: TikTokTokenResponse,
  tiktokUser: TikTokUser,
  now?: Date,
) {
  const currentTime = now ?? new Date();
  return {
    user_id: userId,
    tiktok_open_id: tiktokUser.open_id,
    tiktok_union_id: tiktokUser.union_id || null,
    display_name: tiktokUser.display_name,
    avatar_url: tiktokUser.avatar_url || null,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    token_expires_at: new Date(
      currentTime.getTime() + tokens.expires_in * 1000,
    ).toISOString(),
    refresh_token_expires_at: tokens.refresh_expires_in
      ? new Date(
          currentTime.getTime() + tokens.refresh_expires_in * 1000,
        ).toISOString()
      : null,
    scopes: tokens.scope ? tokens.scope.split(",") : null,
  };
}

/**
 * リフレッシュされたトークンからDB update用オブジェクトを構築する
 */
export function buildTokenUpdateData(
  tokens: Pick<
    TikTokTokenResponse,
    "access_token" | "refresh_token" | "expires_in" | "refresh_expires_in"
  >,
  now?: Date,
) {
  const currentTime = now ?? new Date();
  return {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    token_expires_at: new Date(
      currentTime.getTime() + tokens.expires_in * 1000,
    ).toISOString(),
    refresh_token_expires_at: tokens.refresh_expires_in
      ? new Date(
          currentTime.getTime() + tokens.refresh_expires_in * 1000,
        ).toISOString()
      : null,
  };
}

/**
 * TikTokVideoFromAPIからDB insert用オブジェクトを構築する
 */
export function buildTikTokVideoInsertData(
  video: TikTokVideoFromAPI,
  userId: string,
  creatorId: string,
  creatorUsername?: string,
) {
  return {
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
  };
}

/**
 * TikTokVideoFromAPIからDB update用オブジェクトを構築する
 */
export function buildTikTokVideoUpdateData(video: TikTokVideoFromAPI) {
  return {
    title: video.title || null,
    description: video.video_description || null,
    thumbnail_url: video.cover_image_url || null,
    duration: video.duration || null,
    updated_at: new Date().toISOString(),
  };
}
