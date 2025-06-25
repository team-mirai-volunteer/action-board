export const FOOTER_CONFIG = {
  socialShare: {
    message:
      "チームみらい Action Board - あなたの周りの人にもアクションボードを届けよう！",
  },
  snsLinks: {
    line: "https://line.me/R/ti/p/@teammirai",
    youtube: "https://youtube.com/@teammirai",
    twitter: "https://twitter.com/teammirai",
    instagram: "https://instagram.com/teammirai",
    facebook: "https://facebook.com/teammirai",
    note: "https://note.com/teammirai",
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
  usefulLinks: [
    {
      title: "ダッシュボード",
      description: "サポーター数など更新中",
      url: "https://lookerstudio.google.com/u/0/reporting/e4efc74f-051c-4815-87f1-e4b5e93a3a8c/page/p_p5421pqhtd",
      public: true,
    },
    {
      title: "寄付金額",
      description: "お寄せいただいた気合🔥を公開",
      url: "https://lookerstudio.google.com/u/0/reporting/e4efc74f-051c-4815-87f1-e4b5e93a3a8c/page/p_lvnweavysd",
      public: true,
    },
    {
      title: "ポリマネー",
      description: "お寄せいただいた寄付の使い途全公開",
      url: "https://polimoney.dd2030.org/demo-takahiro-anno-2024",
      public: true,
    },
    {
      title: "チームみらいサポーターガイド",
      description: "サポーター向け限定情報",
      url: "https://team-mirai.notion.site/1f8f6f56bae180fd96e2f809bf1ca0bf?v=1f8f6f56bae181239689000c7e1d858e",
      public: false,
    },
  ],
  feedback: {
    url: "https://team-mirai.notion.site/204f6f56bae1800da8d5dd9c61dd7cd1?pvs=105",
  },
  accordionSections: [
    {
      value: "useful-sites",
      title: "チームみらいお役立ちサイト",
      contentType: "links" as const,
      defaultOpen: true,
      requiresAuth: false,
      linksSource: "usefulLinks" as const,
      containerClassName: "space-y-4 p-4",
      linkClassName:
        "flex gap-4 hover:bg-gray-50 p-2 rounded transition-colors",
      titleClassName: "text-sm font-bold text-black",
      descriptionClassName: "text-xs text-gray-600",
    },
  ],
} as const;
