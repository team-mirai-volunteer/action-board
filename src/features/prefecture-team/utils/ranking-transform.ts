import {
  calculateXpPerCapita,
  PREFECTURE_POPULATIONS,
} from "@/lib/constants/prefecture-populations";
import type { PrefectureTeamRanking } from "../types/prefecture-team-types";

/**
 * RPC関数の戻り値の型定義
 */
export interface PrefectureTeamRankingRow {
  prefecture: string;
  total_xp: number;
  user_count: number;
}

/**
 * RPC結果を人口あたりXPランキングに変換する
 * 不明な都道府県を除外し、人口比XPで降順ソートしてランク付けする
 */
export function transformToXpPerCapitaRanking(
  data: PrefectureTeamRankingRow[],
): PrefectureTeamRanking[] {
  return data
    .filter((item) => PREFECTURE_POPULATIONS[item.prefecture])
    .map((item) => ({
      prefecture: item.prefecture,
      totalXp: item.total_xp,
      userCount: item.user_count,
      xpPerCapita: calculateXpPerCapita(item.total_xp, item.prefecture),
    }))
    .sort((a, b) => b.xpPerCapita - a.xpPerCapita)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
}
