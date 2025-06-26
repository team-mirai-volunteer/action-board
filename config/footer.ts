import type { FooterAccordionSection } from "@/types/footer";

export const USEFUL_LINKS_CONFIG: {
  accordionSections: FooterAccordionSection[];
} = {
  accordionSections: [
    {
      value: "useful-sites",
      title: "チームみらいお役立ちサイト",
      contentType: "links",
      defaultOpen: true,
      requiresAuth: false,
      styling: {
        containerClassName: "space-y-4 p-4",
        linkClassName:
          "flex gap-4 hover:bg-gray-50 p-2 rounded transition-colors",
        titleClassName: "text-sm font-bold text-black",
        descriptionClassName: "text-xs text-gray-600",
      },
      content: {
        links: [
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
      },
    },
  ],
};
