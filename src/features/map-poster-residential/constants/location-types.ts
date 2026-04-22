export const LOCATION_TYPES = [
  { value: "home", label: "自宅" },
  { value: "store_office", label: "店舗事務所" },
  { value: "public_facility", label: "公共施設" },
  { value: "leader_photo_a1", label: "党首顔写真（A1サイズ）" },
  { value: "leader_photo_a2", label: "党首顔写真（A2サイズ）" },
  { value: "logo_a1", label: "ロゴ（A1サイズ）" },
  { value: "logo_a2", label: "ロゴ（A2サイズ）" },
  { value: "other", label: "その他" },
] as const;

export type LocationTypeValue = (typeof LOCATION_TYPES)[number]["value"];
