/**
 * TikTok同期スクリプト用の型定義
 */

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

// DBのtiktok_user_connectionsテーブル
export interface TikTokUserConnection {
  id: string;
  user_id: string;
  tiktok_open_id: string;
  tiktok_union_id: string | null;
  display_name: string | null;
  avatar_url: string | null;
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
  refresh_token_expires_at: string | null;
  scopes: string[] | null;
  created_at: string;
  updated_at: string;
}

// DBのtiktok_videosテーブル
export interface TikTokVideoRecord {
  video_id: string;
  user_id: string;
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
}

// DBのtiktok_video_statsテーブル
export interface TikTokVideoStatsRecord {
  tiktok_video_id: string;
  recorded_at: string;
  view_count: number | null;
  like_count: number | null;
  comment_count: number | null;
  share_count: number | null;
}

// 同期結果
export interface SyncResult {
  totalUsers: number;
  successfulSyncs: number;
  failedSyncs: number;
  newVideos: number;
  updatedVideos: number;
  statsRecorded: number;
  tokensRefreshed: number;
  errors: string[];
}

// ユーザーごとの同期結果
export interface UserSyncResult {
  userId: string;
  tiktokOpenId: string;
  displayName: string | null;
  success: boolean;
  newVideos: number;
  updatedVideos: number;
  statsRecorded: number;
  tokenRefreshed: boolean;
  error?: string;
}
