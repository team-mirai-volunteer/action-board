/**
 * タイトルの括弧前に改行を挿入する
 * 全角括弧（）と半角括弧()の両方に対応
 */
export function formatTitleWithLineBreaks(title: string): string {
  return title.replace(/（/g, "\n（").replace(/\(/g, "\n(");
}

const VOTING_MISSION_SLUGS = ["early-vote", "absent-vote", "overseas-vote"];

/**
 * 投票系ミッションかどうかを判定する
 */
export function isVotingMission(slug: string): boolean {
  return VOTING_MISSION_SLUGS.includes(slug);
}
