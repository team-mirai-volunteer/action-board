export interface FooterConfig {
  feedback: {
    poster_map_url: string;
    url: string;
  };
}

export const FOOTER_BUTTON_STYLES = {
  socialShare:
    "w-12 h-12 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors",
  socialShareCopy:
    "w-12 h-12 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors",
  officialSns:
    "w-12 h-12 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors",
} as const;

export const FOOTER_IMAGE_SIZES = {
  socialIcon: { width: 48, height: 48 },
  logo: { width: 64, height: 64 },
} as const;

export const FOOTER_CONFIG: FooterConfig = {
  feedback: {
    poster_map_url: "https://forms.gle/vyVkGb4CbNahggfW8",
    url: "https://team-mirai.notion.site/204f6f56bae1800da8d5dd9c61dd7cd1?pvs=105",
  },
} as const;
