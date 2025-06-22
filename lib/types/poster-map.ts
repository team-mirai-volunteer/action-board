// lib/types/poster-map.ts

export interface PinData {
  id: number;
  number: string | null;
  address: string | null;
  place_name: string | null;
  lat: number | null;
  long: number | null;
  status: number;
  note: string | null;
  created_at?: string; // オプションとして定義
  cities: {
    prefecture: string;
    city: string;
  } | null;
}

export interface UpdatePinRequest {
  id: number; // stringからnumberに修正
  status: number;
  note: string | null;
}
