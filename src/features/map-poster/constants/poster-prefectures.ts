// center, defaultZoom は coding AI が推定した値なので
// 実際の地図表示に合わせて調整が必要
// lib/constants/ の PrefectureData と役割が一部重複しているのでいずれ整理する
// POSTER_PREFECTURE_MAP の jp は削除し、 PrefectureData の key から center, defaultZoom を参照する
// あるいは PrefectureData に center, defaultZoom を追加してもいいかも
type LatLng = [number, number];
export const POSTER_PREFECTURE_MAP = {
  hokkaido: {
    jp: "北海道",
    center: [43.0642, 141.3469] as LatLng,
    defaultZoom: 8,
  },
  aomori: {
    jp: "青森県",
    center: [40.8244, 140.74] as LatLng,
    defaultZoom: 10,
  },
  iwate: {
    jp: "岩手県",
    center: [39.7036, 141.1527] as LatLng,
    defaultZoom: 9,
  },
  miyagi: {
    jp: "宮城県",
    center: [38.2688, 140.8721] as LatLng,
    defaultZoom: 10,
  },
  akita: {
    jp: "秋田県",
    center: [39.7186, 140.1024] as LatLng,
    defaultZoom: 9,
  },
  yamagata: {
    jp: "山形県",
    center: [38.2404, 140.3633] as LatLng,
    defaultZoom: 10,
  },
  fukushima: {
    jp: "福島県",
    center: [37.7503, 140.4676] as LatLng,
    defaultZoom: 9,
  },
  ibaraki: {
    jp: "茨城県",
    center: [36.3418, 140.4468] as LatLng,
    defaultZoom: 10,
  },
  tochigi: {
    jp: "栃木県",
    center: [36.5658, 139.8836] as LatLng,
    defaultZoom: 10,
  },
  gunma: {
    jp: "群馬県",
    center: [36.391, 139.0608] as LatLng,
    defaultZoom: 10,
  },
  saitama: {
    jp: "埼玉県",
    center: [35.857, 139.649] as LatLng,
    defaultZoom: 11,
  },
  chiba: {
    jp: "千葉県",
    center: [35.605, 140.1233] as LatLng,
    defaultZoom: 10,
  },
  tokyo: {
    jp: "東京都",
    center: [35.6762, 139.6503] as LatLng,
    defaultZoom: 12,
  },
  kanagawa: {
    jp: "神奈川県",
    center: [35.4478, 139.6425] as LatLng,
    defaultZoom: 11,
  },
  niigata: {
    jp: "新潟県",
    center: [37.9024, 139.0235] as LatLng,
    defaultZoom: 9,
  },
  toyama: {
    jp: "富山県",
    center: [36.6953, 137.2113] as LatLng,
    defaultZoom: 10,
  },
  ishikawa: {
    jp: "石川県",
    center: [36.5946, 136.6256] as LatLng,
    defaultZoom: 10,
  },
  fukui: {
    jp: "福井県",
    center: [36.0652, 136.2216] as LatLng,
    defaultZoom: 10,
  },
  yamanashi: {
    jp: "山梨県",
    center: [35.6642, 138.5684] as LatLng,
    defaultZoom: 10,
  },
  nagano: {
    jp: "長野県",
    center: [36.6513, 138.181] as LatLng,
    defaultZoom: 9,
  },
  gifu: {
    jp: "岐阜県",
    center: [35.3912, 136.7223] as LatLng,
    defaultZoom: 10,
  },
  shizuoka: {
    jp: "静岡県",
    center: [34.9769, 138.3831] as LatLng,
    defaultZoom: 10,
  },
  aichi: {
    jp: "愛知県",
    center: [35.1802, 136.9066] as LatLng,
    defaultZoom: 10,
  },
  mie: {
    jp: "三重県",
    center: [34.7303, 136.5086] as LatLng,
    defaultZoom: 10,
  },
  shiga: {
    jp: "滋賀県",
    center: [35.0045, 135.8686] as LatLng,
    defaultZoom: 11,
  },
  kyoto: {
    jp: "京都府",
    center: [35.0211, 135.7556] as LatLng,
    defaultZoom: 11,
  },
  osaka: {
    jp: "大阪府",
    center: [34.6937, 135.5023] as LatLng,
    defaultZoom: 12,
  },
  hyogo: {
    jp: "兵庫県",
    center: [34.6913, 135.1831] as LatLng,
    defaultZoom: 10,
  },
  nara: {
    jp: "奈良県",
    center: [34.6851, 135.8329] as LatLng,
    defaultZoom: 11,
  },
  wakayama: {
    jp: "和歌山県",
    center: [34.2261, 135.1675] as LatLng,
    defaultZoom: 10,
  },
  tottori: {
    jp: "鳥取県",
    center: [35.5014, 134.2351] as LatLng,
    defaultZoom: 10,
  },
  shimane: {
    jp: "島根県",
    center: [35.4723, 133.0505] as LatLng,
    defaultZoom: 10,
  },
  okayama: {
    jp: "岡山県",
    center: [34.6617, 133.9349] as LatLng,
    defaultZoom: 10,
  },
  hiroshima: {
    jp: "広島県",
    center: [34.3963, 132.4596] as LatLng,
    defaultZoom: 10,
  },
  yamaguchi: {
    jp: "山口県",
    center: [34.1861, 131.4714] as LatLng,
    defaultZoom: 10,
  },
  tokushima: {
    jp: "徳島県",
    center: [34.0658, 134.5595] as LatLng,
    defaultZoom: 10,
  },
  kagawa: {
    jp: "香川県",
    center: [34.3401, 134.0434] as LatLng,
    defaultZoom: 11,
  },
  ehime: {
    jp: "愛媛県",
    center: [33.8416, 132.7658] as LatLng,
    defaultZoom: 10,
  },
  kochi: {
    jp: "高知県",
    center: [33.5597, 133.5311] as LatLng,
    defaultZoom: 10,
  },
  fukuoka: {
    jp: "福岡県",
    center: [33.5904, 130.4017] as LatLng,
    defaultZoom: 10,
  },
  saga: {
    jp: "佐賀県",
    center: [33.2494, 130.2989] as LatLng,
    defaultZoom: 11,
  },
  nagasaki: {
    jp: "長崎県",
    center: [32.7503, 129.8777] as LatLng,
    defaultZoom: 9,
  },
  kumamoto: {
    jp: "熊本県",
    center: [32.7898, 130.7417] as LatLng,
    defaultZoom: 10,
  },
  oita: {
    jp: "大分県",
    center: [33.2382, 131.6126] as LatLng,
    defaultZoom: 10,
  },
  miyazaki: {
    jp: "宮崎県",
    center: [31.9077, 131.4202] as LatLng,
    defaultZoom: 10,
  },
  kagoshima: {
    jp: "鹿児島県",
    center: [31.5602, 130.5581] as LatLng,
    defaultZoom: 9,
  },
  okinawa: {
    jp: "沖縄県",
    center: [26.2124, 127.6809] as LatLng,
    defaultZoom: 9,
  },
} as const satisfies Record<
  string,
  { jp: string; center: LatLng; defaultZoom: number }
>;

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

// Helper function to get default zoom for a prefecture
export function getPrefectureDefaultZoom(
  prefectureKey: PosterPrefectureKey,
): number {
  return POSTER_PREFECTURE_MAP[prefectureKey].defaultZoom;
}
