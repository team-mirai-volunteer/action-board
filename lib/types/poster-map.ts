export interface PinData {
  id: string;
  number: string;
  address: string;
  place_name: string;
  lat: number;
  long: number;
  status: number;
  note: string | null;
  created_at: string;
  updated_at?: string;
}

export interface UpdatePinRequest {
  id: string;
  status: number;
  note: string | null;
}
