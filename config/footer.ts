import type { FooterConfig } from "@/types/footer";

export const FOOTER_CONFIG: FooterConfig = {
  socialShare: {
    message:
      "チームみらい Action Board - あなたの周りの人にもアクションボードを届けよう！",
  },
  snsLinks: {
    line: "https://lin.ee/EllKv15",
    youtube: "https://www.youtube.com/channel/UCiMwbmcCSMORJ-85XWhStBw",
    twitter: "https://x.com/team_mirai_jp",
    instagram: "https://www.instagram.com/annotakahiro2024/",
    facebook: "https://www.facebook.com/teammirai.official",
    note: "https://note.com/annotakahiro24",
  },
  images: {
    basePath: "https://team-mir.ai/images/sns",
    icons: {
      line: "icon_line.png",
      youtube: "icon_youtube.png",
      twitter: "icon_x.png",
      instagram: "icon_instagram.png",
      facebook: "icon_facebook.png",
      note: "icon_note.png",
    },
  },
  feedback: {
    url: "https://team-mirai.notion.site/204f6f56bae1800da8d5dd9c61dd7cd1?pvs=105",
  },
} as const;
