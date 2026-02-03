/**
 * ミッションの表示用達成数を取得する
 * ポスティングミッションの場合は枚数、それ以外は達成人数を返す
 */
export function getMissionDisplayCount(
  missionId: string,
  achievementCountMap: Map<string, number>,
  postingCountMap?: Map<string, number>,
): number {
  return (
    postingCountMap?.get(missionId) ?? achievementCountMap.get(missionId) ?? 0
  );
}
