/** ピン配置登録時の入力データ */
export interface CreatePlacementInput {
  lat: number;
  lng: number;
  poster_count: number;
  address?: string;
  note?: string;
}

/** ピン配置更新時の入力データ */
export interface UpdatePlacementInput {
  poster_count?: number;
  address?: string;
  note?: string;
}

/** DBから取得した掲示記録 */
export interface PosterPlacement {
  id: string;
  user_id: string;
  lat: number;
  lng: number;
  prefecture: string | null;
  city: string | null;
  address: string | null;
  postcode: string | null;
  poster_count: number;
  note: string | null;
  created_at: string;
  updated_at: string;
}

/** 市区町村別集計（公開用） */
export interface CityStats {
  prefecture: string;
  city: string;
  total_count: number;
  contributor_count: number;
}

/** 市区町村内の貢献者別集計（公開用、名前のみ） */
export interface CityContributor {
  display_name: string;
  total_count: number;
}
