// YouTube API から取得する動画データの型定義

export interface YouTubeSearchResult {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    channelId: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: {
      default?: { url: string };
      medium?: { url: string };
      high?: { url: string };
    };
  };
}

export interface YouTubeVideoDetails {
  id: string;
  snippet: {
    title: string;
    description: string;
    channelId: string;
    channelTitle: string;
    publishedAt: string;
    tags?: string[];
    thumbnails: {
      default?: { url: string };
      medium?: { url: string };
      high?: { url: string };
    };
  };
  contentDetails: {
    duration: string;
  };
  statistics: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
}

// DBに保存する動画データの型
export interface YouTubeVideoRecord {
  video_id: string; // PRIMARY KEY
  video_url: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  channel_id: string;
  channel_title: string | null;
  published_at: string | null;
  duration: string | null;
  tags: string[] | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// DBに保存する統計スナップショットの型
export interface YouTubeVideoStatsRecord {
  id?: string;
  video_id: string; // youtube_videos.video_id への外部キー
  recorded_at: string;
  view_count: number | null;
  like_count: number | null;
  comment_count: number | null;
  created_at?: string;
}

// 同期結果のサマリー
export interface SyncResult {
  newVideos: number;
  updatedVideos: number;
  statsRecorded: number;
  errors: string[];
}
