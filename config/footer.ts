import type { FooterConfig } from "../types/footer";

export const footerConfig: FooterConfig = {
  socialShare: {
    messages: {
      line: "チームみらいアクションボードで政治参加しよう！",
      twitter:
        "チームみらいアクションボードで政治参加しよう！ #チームみらい #政治参加",
      facebook: "チームみらいアクションボードで政治参加しよう！",
    },
  },
  officialSNS: {
    title: "公式SNS",
    links: [
      {
        name: "X (Twitter)",
        url: "https://x.com/team_mirai_",
        icon: "twitter",
      },
      {
        name: "Instagram",
        url: "https://www.instagram.com/team_mirai_/",
        icon: "instagram",
      },
      {
        name: "YouTube",
        url: "https://www.youtube.com/@team_mirai_",
        icon: "youtube",
      },
      {
        name: "TikTok",
        url: "https://www.tiktok.com/@team_mirai_",
        icon: "tiktok",
      },
    ],
  },
  feedback: {
    title: "ご意見をお聞かせください",
    description:
      "チームみらいアクションボードをより良いサービスにするため、皆様のご意見・ご要望をお聞かせください。いただいたフィードバックは今後の改善に活用させていただきます。",
    buttonText: "ご意見箱を開く",
    url: "https://team-mirai.notion.site/204f6f56bae1800da8d5dd9c61dd7cd1?pvs=105",
  },
};
