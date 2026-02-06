import { ARTIFACT_TYPES } from "@/lib/types/artifact-types";

/**
 * ポスター活動のテキストを生成する。
 */
export function buildPosterActivityText(
  prefecture: string,
  city: string,
  boardNumber: string,
  boardName?: string | null,
  boardNote?: string | null,
): string {
  const locationInfo = `${prefecture}${city} ${boardNumber}`;
  const nameInfo = boardName ? ` (${boardName})` : "";
  const statusInfo = boardNote ? ` - 状況: ${boardNote}` : "";
  return `${locationInfo}${nameInfo}に貼付${statusInfo}`;
}

/**
 * ポスティング活動のテキストを生成する。
 */
export function buildPostingActivityText(
  postingCount: number,
  locationText?: string,
): string {
  return `${postingCount}枚を${locationText ?? ""}に配布`;
}

/**
 * artifact type のラベルを取得する（ログ用）。
 * ARTIFACT_TYPES に存在するキーならそのまま返し、存在しなければ "OTHER" を返す。
 */
export function getArtifactTypeLabel(artifactType: string): string {
  for (const type of Object.values(ARTIFACT_TYPES)) {
    if (type.key === artifactType) {
      return type.key;
    }
  }
  return "OTHER";
}
