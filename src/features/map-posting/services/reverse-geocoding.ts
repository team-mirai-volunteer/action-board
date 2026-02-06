/**
 * Nominatim API を使用した逆ジオコーディングサービス
 * OpenStreetMap の無料 API（APIキー不要）
 *
 * 利用規約: https://operations.osmfoundation.org/policies/nominatim/
 * - 1秒に1リクエストを超えないこと
 * - User-Agent を設定すること
 */

import { buildAddressFromGeocode } from "@/features/map-posting/utils/address-utils";

export interface ReverseGeocodingResult {
  prefecture: string | null;
  city: string | null;
  address: string | null;
  postcode: string | null;
}

interface NominatimAddress {
  province?: string; // 都道府県
  state?: string; // 都道府県（代替）
  "ISO3166-2-lvl4"?: string; // 都道府県コード（例: JP-13）
  city?: string; // 市区
  town?: string; // 町
  village?: string; // 村
  city_district?: string; // 区
  suburb?: string; // 地区
  neighbourhood?: string; // 近隣（丁目）
  quarter?: string; // 街区
  road?: string; // 道路
  house_number?: string; // 番地
  postcode?: string; // 郵便番号
}

interface NominatimResponse {
  address?: NominatimAddress;
  display_name?: string;
  error?: string;
}

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/reverse";
const USER_AGENT = "ActionBoard/1.0";

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<ReverseGeocodingResult> {
  try {
    const url = new URL(NOMINATIM_BASE_URL);
    url.searchParams.set("lat", lat.toString());
    url.searchParams.set("lon", lng.toString());
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("accept-language", "ja"); // 日本語で結果取得

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": USER_AGENT,
      },
    });

    if (!response.ok) {
      console.error(`Nominatim API error: ${response.status}`);
      return { prefecture: null, city: null, address: null, postcode: null };
    }

    const data: NominatimResponse = await response.json();

    if (data.error) {
      console.error(`Nominatim error: ${data.error}`);
      return { prefecture: null, city: null, address: null, postcode: null };
    }

    const addr = data.address;
    if (!addr) {
      return { prefecture: null, city: null, address: null, postcode: null };
    }

    return buildAddressFromGeocode(addr);
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return { prefecture: null, city: null, address: null, postcode: null };
  }
}
