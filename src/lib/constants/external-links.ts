// 外部リンク設定
export const EXTERNAL_LINKS = {
  // FAQ
  faq: "https://team-mirai.notion.site/228f6f56bae18037957dd5f108d00e2f",

  // ご意見箱
  feedback_action_board:
    "https://team-mirai.notion.site/204f6f56bae1800da8d5dd9c61dd7cd1?pvs=105",
  feedback_poster_map: "https://forms.gle/vyVkGb4CbNahggfW8",

  // 組織内
  team_mirai_main: "https://team-mir.ai/",
  team_mirai_policy: "https://policy.team-mir.ai/view/README.md",
  team_mirai_action_board: "https://action.team-mir.ai/",
  team_mirai_donation: "https://team-mir.ai/support/donation",

  // SNSアカウント
  x_team_mirai: "https://x.com/team_mirai_jp",
  x_anno_takahiro: "https://x.com/takahiroanno",
  youtube_team_mirai: "https://youtube.com/channel/UC72A_x2FKHkJ8Nc2eIzqj8Q",
  line_team_mirai:
    "https://line.me/R/ti/p/@465hhyop?oat_content=url&ts=05062204",
  note_anno_takahiro: "https://note.com/annotakahiro24",
  tiktok_anno_takahiro: "https://www.tiktok.com/@annotakahiro2024",
  threads_anno_takahiro: "https://www.threads.com/@annotakahiro2024",

  // SNS指名検索
  x_search_team_mirai: "https://x.com/search?q=%23チームはやま",
  note_search_team_mirai: "https://note.com/search?q=チームはやま",
  youtube_search_team_mirai:
    "https://www.youtube.com/results?search_query=%E3%83%81%E3%83%BC%E3%83%A0%E3%81%BF%E3%82%89%E3%81%84",

  // その他
  speakerdeck_manifest:
    "https://speakerdeck.com/teammirai/timumiraimanihuesuto-yao-yue-ban-v0-dot-2",
} as const;
// 利用側で `keyof typeof EXTERNAL_LINKS` を直接書く手間を省く
export type ExternalLinkKey = keyof typeof EXTERNAL_LINKS;
