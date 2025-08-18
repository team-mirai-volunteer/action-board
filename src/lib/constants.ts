// ポスティングミッションで1枚のポスティングで付与するポイント
export const POSTING_POINTS_PER_UNIT = 50;

// ポスターミッションで1枚の貼り付けで付与するポイント
export const POSTER_POINTS_PER_UNIT = 400;

// YouTubeチャンネル登録ミッションの設定
export const YOUTUBE_MISSION_CONFIG = {
  // YouTubeチャンネル登録ミッションslug
  SLUG: "youtube-subscribe",
  // 安野たかひろYouTubeチャンネルID
  CHANNEL_ID: "UC72A_x2FKHkJ8Nc2eIzqj8Q",
} as const;

// ポスティングミッションでの最大枚数
export const MAX_POSTING_COUNT = 100000;

// ポスターミッションでの最大枚数
export const MAX_POSTER_COUNT = 1;

// ポスターマップの最大ズーム値
export const MAX_ZOOM = 18;

// 外部リンクURL
export const EXTERNAL_LINKS = {
  // よくあるご質問(FAQ)
  FAQ: "https://www.notion.so/team-mirai/228f6f56bae18037957dd5f108d00e2f",
} as const;
