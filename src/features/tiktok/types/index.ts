/**
 * TikTok連携機能の型定義
 */

// TikTokユーザー情報
export interface TikTokUser {
  open_id: string;
  union_id?: string;
  avatar_url?: string;
  avatar_url_100?: string;
  avatar_large_url?: string;
  display_name: string;
  bio_description?: string;
  profile_deep_link?: string;
  is_verified?: boolean;
  follower_count?: number;
  following_count?: number;
  likes_count?: number;
  video_count?: number;
}

// TikTokトークンレスポンス
export interface TikTokTokenResponse {
  access_token: string;
  expires_in: number;
  open_id: string;
  refresh_expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
}

// TikTok動画情報（API レスポンス）
export interface TikTokVideoFromAPI {
  id: string;
  create_time: number;
  cover_image_url?: string;
  share_url: string;
  video_description?: string;
  duration: number;
  title?: string;
  like_count?: number;
  comment_count?: number;
  share_count?: number;
  view_count?: number;
}

// TikTok動画一覧レスポンス
export interface TikTokVideoListResponse {
  data: {
    videos: TikTokVideoFromAPI[];
    cursor: number;
    has_more: boolean;
  };
  error: {
    code: string;
    message: string;
    log_id: string;
  };
}

// TikTokユーザー情報レスポンス
export interface TikTokUserInfoResponse {
  data: {
    user: TikTokUser;
  };
  error: {
    code: string;
    message: string;
    log_id: string;
  };
}

// DBに保存するTikTok動画情報
export interface TikTokVideo {
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
}

// DBに保存するTikTok動画統計情報
export interface TikTokVideoStats {
  id: string;
  tiktok_video_id: string;
  recorded_at: string;
  view_count: number | null;
  like_count: number | null;
  comment_count: number | null;
  share_count: number | null;
  created_at: string;
}

// TikTok連携結果
export interface TikTokLinkResult {
  success: boolean;
  error?: string;
  user?: TikTokUser;
}

// TikTok動画同期結果
export interface TikTokSyncResult {
  success: boolean;
  error?: string;
  syncedCount?: number;
  skippedCount?: number;
}
