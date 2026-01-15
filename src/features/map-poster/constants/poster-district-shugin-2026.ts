// 衆議院議員選挙 区割り (Electoral Districts) for Poster Map
// Format: prefecture-number (e.g., tokyo-1, kanagawa-5)

export const POSTER_DISTRICT_MAP = {
  "tokyo-1": {
    jp: "東京1区",
    prefecture: "東京都",
    center: [35.6895, 139.6917] as [number, number], // 千代田区・港区・新宿区 area
    defaultZoom: 13,
  },
  // Add more districts here as data becomes available
  // Example entries (uncomment when ready):
  // "tokyo-2": {
  //   jp: "東京2区",
  //   prefecture: "東京都",
  //   center: [35.7138, 139.7566] as [number, number],
  //   defaultZoom: 13,
  // },
  // "kanagawa-5": {
  //   jp: "神奈川5区",
  //   prefecture: "神奈川県",
  //   center: [35.3293, 139.5500] as [number, number],
  //   defaultZoom: 13,
  // },
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
