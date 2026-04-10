export const LOCATION_TYPES = [
  { value: "home", label: "自宅" },
  { value: "store_office", label: "店舗事務所" },
  { value: "public_facility", label: "公共施設" },
  { value: "other", label: "その他" },
] as const;

export type LocationTypeValue = (typeof LOCATION_TYPES)[number]["value"];
