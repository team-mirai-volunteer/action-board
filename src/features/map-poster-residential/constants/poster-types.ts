export const POSTER_TYPES = [
  { value: "leader_face_a1", label: "党首顔写真（A1サイズ）" },
  { value: "leader_face_a2", label: "党首顔写真（A2サイズ）" },
  { value: "logo_a1", label: "ロゴ（A1サイズ）" },
  { value: "logo_a2", label: "ロゴ（A2サイズ）" },
] as const;

export type PosterTypeValue = (typeof POSTER_TYPES)[number]["value"];
