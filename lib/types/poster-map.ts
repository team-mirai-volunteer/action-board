export interface PinData {
  id?: string;
  place_name: string | null;
  address: string;
  number: string;
  lat: number | null;
  long: number | null;
  status: number;
  note: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UpdatePinRequest {
  id: string;
  status: number;
  note: string | null;
}
