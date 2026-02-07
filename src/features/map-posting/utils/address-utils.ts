/**
 * Nominatimレスポンスの住所部品から住所情報を組み立てる純粋関数群
 */

interface NominatimAddress {
  province?: string;
  state?: string;
  "ISO3166-2-lvl4"?: string;
  city?: string;
  town?: string;
  village?: string;
  city_district?: string;
  suburb?: string;
  neighbourhood?: string;
  quarter?: string;
  road?: string;
  house_number?: string;
  postcode?: string;
}

// ISO 3166-2:JP コードから都道府県名へのマッピング
const ISO3166_TO_PREFECTURE: Record<string, string> = {
  "JP-01": "北海道",
  "JP-02": "青森県",
  "JP-03": "岩手県",
  "JP-04": "宮城県",
  "JP-05": "秋田県",
  "JP-06": "山形県",
  "JP-07": "福島県",
  "JP-08": "茨城県",
  "JP-09": "栃木県",
  "JP-10": "群馬県",
  "JP-11": "埼玉県",
  "JP-12": "千葉県",
  "JP-13": "東京都",
  "JP-14": "神奈川県",
  "JP-15": "新潟県",
  "JP-16": "富山県",
  "JP-17": "石川県",
  "JP-18": "福井県",
  "JP-19": "山梨県",
  "JP-20": "長野県",
  "JP-21": "岐阜県",
  "JP-22": "静岡県",
  "JP-23": "愛知県",
  "JP-24": "三重県",
  "JP-25": "滋賀県",
  "JP-26": "京都府",
  "JP-27": "大阪府",
  "JP-28": "兵庫県",
  "JP-29": "奈良県",
  "JP-30": "和歌山県",
  "JP-31": "鳥取県",
  "JP-32": "島根県",
  "JP-33": "岡山県",
  "JP-34": "広島県",
  "JP-35": "山口県",
  "JP-36": "徳島県",
  "JP-37": "香川県",
  "JP-38": "愛媛県",
  "JP-39": "高知県",
  "JP-40": "福岡県",
  "JP-41": "佐賀県",
  "JP-42": "長崎県",
  "JP-43": "熊本県",
  "JP-44": "大分県",
  "JP-45": "宮崎県",
  "JP-46": "鹿児島県",
  "JP-47": "沖縄県",
};

/**
 * ISO3166-2:JP コードから都道府県名に変換する。
 * 該当しない場合はnullを返す。
 */
export function convertISO3166ToPrefecture(code: string): string | null {
  return ISO3166_TO_PREFECTURE[code] || null;
}

/**
 * Nominatimの住所データから構造化された住所情報を組み立てる。
 */
export function buildAddressFromGeocode(addr: NominatimAddress): {
  prefecture: string | null;
  city: string | null;
  address: string | null;
  postcode: string | null;
} {
  // 都道府県を取得（ISO3166-2コードから変換、またはprovince/stateから直接取得）
  let prefecture: string | null = null;
  if (addr["ISO3166-2-lvl4"]) {
    prefecture = ISO3166_TO_PREFECTURE[addr["ISO3166-2-lvl4"]] || null;
  }
  if (!prefecture) {
    prefecture = addr.province || addr.state || null;
  }

  // 市区町村を取得（市 + 区 or 町/村）
  const cityParts: string[] = [];
  if (addr.city) cityParts.push(addr.city);
  if (addr.city_district) cityParts.push(addr.city_district);
  if (addr.town) cityParts.push(addr.town);
  if (addr.village) cityParts.push(addr.village);
  const city = cityParts.length > 0 ? cityParts.join("") : null;

  // 詳細住所を取得
  const addressParts: string[] = [];
  if (addr.suburb) addressParts.push(addr.suburb);
  if (addr.neighbourhood) addressParts.push(addr.neighbourhood);
  if (addr.quarter) addressParts.push(addr.quarter);
  if (addr.road) addressParts.push(addr.road);
  if (addr.house_number) addressParts.push(addr.house_number);
  const address = addressParts.length > 0 ? addressParts.join("") : null;

  // 郵便番号を取得
  const postcode = addr.postcode || null;

  return { prefecture, city, address, postcode };
}
