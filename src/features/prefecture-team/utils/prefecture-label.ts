export function getPrefectureInternalLabel(prefecture: string): string {
  if (prefecture === "東京都") return "都内";
  if (prefecture === "北海道") return "道内";
  if (prefecture.endsWith("府")) return "府内";
  return "県内";
}
