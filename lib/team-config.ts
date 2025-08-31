/**
 * チーム設定ファイル
 * OSS対応: このファイルを変更するだけでチーム全体のブランディングを変更可能
 */

export const TEAM_CONFIG = {
  // チーム名設定
  name: {
    ja: "チームはやま",
    en: "Team Hayama",
    slug: "team-hayama",
    // URLやファイル名で使用する短縮形
    short: "hayama",
  },

  // ブランドカラー設定（葉山の自然をイメージ）
  colors: {
    // メインカラー: 葉山の海をイメージしたブルー
    primary: "#1E88E5",
    primaryHsl: "207 83% 57%",

    // セカンダリカラー: 葉山の緑をイメージしたグリーン
    secondary: "#81C784",
    secondaryHsl: "122 39% 64%",

    // アクセントカラー: 爽やかなスカイブルー
    accent: "#4FC3F7",
    accentHsl: "199 92% 64%",

    // レガシーカラー（段階的移行用）
    legacy: {
      tmTeal: "#30BAA7",
    },
  },

  // ブランド情報
  brand: {
    // サイト情報
    title: "チームはやま アクションボード",
    description:
      "政治活動をもっと身近に。政治活動をゲーム感覚で楽しめる、チームはやまのアクションボード。",

    // ドメイン設定
    domain: "team-hayama.jp",
    siteName: "チームはやま",

    // ソーシャルメディア
    social: {
      x: "team_hayama_jp",
      youtube: "UCTeamHayama",
      line: "@teamhayama",
    },

    // 外部リンク
    links: {
      main: "https://team-hayama.jp/",
      policy: "https://policy.team-hayama.jp/view/README.md",
      actionBoard: "https://action.team-hayama.jp/",
      donation: "https://team-hayama.jp/support/donation",
    },
  },

  // メタデータ設定
  meta: {
    defaultImage: "/img/ogp-default.png?v=20250714",
    favicon: {
      icon: "/favicon.ico",
      png: "/icon.png",
      apple: "/apple-icon.png",
    },
  },
} as const;

// 型定義
export type TeamConfig = typeof TEAM_CONFIG;

// ヘルパー関数
export const getTeamName = (locale: "ja" | "en" = "ja") => {
  return TEAM_CONFIG.name[locale];
};

export const getTeamColor = (colorName: keyof typeof TEAM_CONFIG.colors) => {
  return TEAM_CONFIG.colors[colorName];
};

export const getTeamLink = (linkName: keyof typeof TEAM_CONFIG.brand.links) => {
  return TEAM_CONFIG.brand.links[linkName];
};
