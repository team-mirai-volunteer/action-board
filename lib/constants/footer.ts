export const FOOTER_IMAGE_SIZES = {
  logo: {
    width: 200,
    height: 60,
  },
} as const;

export const FOOTER_STYLES = {
  section: "py-8 px-4 md:container md:mx-auto",
  socialButton:
    "flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 hover:scale-105",
  snsLink:
    "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 hover:scale-110",
} as const;
