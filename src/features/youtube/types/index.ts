/**
 * YouTube連携機能の型定義
 */

// Googleトークンレスポンス
export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
}

// YouTubeチャンネル情報
export interface YouTubeChannel {
  id: string;
  title: string;
  description?: string;
  customUrl?: string;
  thumbnailUrl?: string;
  uploadsPlaylistId?: string;
}

// YouTubeチャンネルAPIレスポンス
export interface YouTubeChannelResponse {
  kind: string;
  etag: string;
  items: Array<{
    kind: string;
    etag: string;
    id: string;
    snippet: {
      title: string;
      description: string;
      customUrl?: string;
      thumbnails: {
        default?: { url: string };
        medium?: { url: string };
        high?: { url: string };
      };
    };
    contentDetails: {
      relatedPlaylists: {
        likes: string;
        uploads: string;
      };
    };
  }>;
}

// YouTube連携結果
export interface YouTubeLinkResult {
  success: boolean;
  error?: string;
  channel?: YouTubeChannel;
}

// YouTube連携状態
export interface YouTubeLinkStatus {
  isLinked: boolean;
  channelId?: string;
  channelTitle?: string;
  thumbnailUrl?: string;
  linkedAt?: string;
}

// アップロード動画（統計情報付き）- youtube-statsから再エクスポート
export type { YouTubeVideoWithStats } from "@/features/youtube-stats/types";
