export const POSTER_PREFECTURE_MAP = {
  hokkaido: { jp: "北海道", center: [43.0642, 141.3469] as [number, number] },
  miyagi: { jp: "宮城県", center: [38.2688, 140.8721] as [number, number] },
  saitama: { jp: "埼玉県", center: [35.857, 139.649] as [number, number] },
  chiba: { jp: "千葉県", center: [35.605, 140.1233] as [number, number] },
  tokyo: { jp: "東京都", center: [35.6762, 139.6503] as [number, number] },
  kanagawa: { jp: "神奈川県", center: [35.4478, 139.6425] as [number, number] },
  nagano: { jp: "長野県", center: [36.6513, 138.181] as [number, number] },
  aichi: { jp: "愛知県", center: [35.1802, 136.9066] as [number, number] },
  osaka: { jp: "大阪府", center: [34.6937, 135.5023] as [number, number] },
  hyogo: { jp: "兵庫県", center: [34.6913, 135.1831] as [number, number] },
  ehime: { jp: "愛媛県", center: [33.8416, 132.7658] as [number, number] },
  fukuoka: { jp: "福岡県", center: [33.5904, 130.4017] as [number, number] },
} as const;

export type PosterPrefectureKey = keyof typeof POSTER_PREFECTURE_MAP;

// Reverse mapping for data loading
export const JP_TO_EN_PREFECTURE: Record<string, PosterPrefectureKey> =
  Object.entries(POSTER_PREFECTURE_MAP).reduce(
    (acc, [key, value]) => {
      acc[value.jp] = key as PosterPrefectureKey;
      return acc;
    },
    {} as Record<string, PosterPrefectureKey>,
  );

// Get all valid Japanese prefecture names
export const VALID_JP_PREFECTURES = Object.values(POSTER_PREFECTURE_MAP).map(
  (p) => p.jp,
);

// Get all valid English prefecture keys
export const VALID_EN_PREFECTURES = Object.keys(
  POSTER_PREFECTURE_MAP,
) as PosterPrefectureKey[];
