/**
 * Prefecture Team ranking type definitions
 */

/**
 * 都道府県対抗ランキングのアイテム
 */
export interface PrefectureTeamRanking {
  /** 都道府県名 */
  prefecture: string;
  /** 順位（人口比XPでソート） */
  rank: number;
  /** 人口比XP（人口1万人あたり） */
  xpPerCapita: number;
  /** 合計XP */
  totalXp: number;
  /** 参加人数 */
  userCount: number;
}

/**
 * ユーザーの都道府県内貢献度
 */
export interface UserPrefectureContribution {
  /** 都道府県名 */
  prefecture: string;
  /** ユーザーのXP */
  userXp: number;
  /** 県全体のXP */
  prefectureTotalXp: number;
  /** 県内順位 */
  userRankInPrefecture: number;
  /** 貢献度（%） */
  contributionPercent: number;
}
