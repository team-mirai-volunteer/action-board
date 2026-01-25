// 衆議院議員選挙 区割り (Electoral Districts) for Poster Map
// Format: prefecture-number (e.g., tokyo-1, kanagawa-5)

export const POSTER_DISTRICT_MAP = {
  "chiba-5": {
    jp: "千葉5区",
    prefecture: "千葉県",
    center: [35.6719, 139.9311] as [number, number], // 市川市・浦安市
    defaultZoom: 13,
  },
  "tokyo-2": {
    jp: "東京2区",
    prefecture: "東京都",
    center: [35.705, 139.77] as [number, number], // 中央区・文京区・台東区
    defaultZoom: 13,
  },
  "tokyo-7": {
    jp: "東京7区",
    prefecture: "東京都",
    center: [35.658, 139.71] as [number, number], // 渋谷区
    defaultZoom: 13,
  },
  "tokyo-26": {
    jp: "東京26区",
    prefecture: "東京都",
    center: [35.633, 139.685] as [number, number], // 目黒区・大田区北部
    defaultZoom: 13,
  },
  "kyoto-2": {
    jp: "京都2区",
    prefecture: "京都府",
    center: [35.0116, 135.7681] as [number, number], // 左京区・東山区
    defaultZoom: 13,
  },
} as const;

export type PosterDistrictKey = keyof typeof POSTER_DISTRICT_MAP;

// Reverse mapping: "東京1区" -> "tokyo-1"
export const JP_TO_EN_DISTRICT: Record<string, PosterDistrictKey> =
  Object.entries(POSTER_DISTRICT_MAP).reduce(
    (acc, [key, value]) => {
      acc[value.jp] = key as PosterDistrictKey;
      return acc;
    },
    {} as Record<string, PosterDistrictKey>,
  );

// Get all valid Japanese district names
export const VALID_JP_DISTRICTS = Object.values(POSTER_DISTRICT_MAP).map(
  (d) => d.jp,
);

// Get all valid English district keys
export const VALID_EN_DISTRICTS = Object.keys(
  POSTER_DISTRICT_MAP,
) as PosterDistrictKey[];

// Helper function to get default zoom for a district
export function getDistrictDefaultZoom(districtKey: PosterDistrictKey): number {
  return POSTER_DISTRICT_MAP[districtKey].defaultZoom;
}

// Helper function to check if a key is a valid district
export function isValidDistrict(key: string): key is PosterDistrictKey {
  return key in POSTER_DISTRICT_MAP;
}
