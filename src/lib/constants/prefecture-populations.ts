/**
 * 都道府県の人口データ（2024年推計人口）
 * 単位: 人
 * 出典: 総務省統計局 人口推計
 */
export const PREFECTURE_POPULATIONS: Record<string, number> = {
  北海道: 5043000,
  青森県: 1165000,
  岩手県: 1145000,
  宮城県: 2248000,
  秋田県: 897000,
  山形県: 1011000,
  福島県: 1743000,
  茨城県: 2806000,
  栃木県: 1885000,
  群馬県: 1890000,
  埼玉県: 7332000,
  千葉県: 6251000,
  東京都: 14178000,
  神奈川県: 9225000,
  新潟県: 2099000,
  富山県: 997000,
  石川県: 1098000,
  福井県: 739000,
  山梨県: 791000,
  長野県: 1987000,
  岐阜県: 1916000,
  静岡県: 3527000,
  愛知県: 7460000,
  三重県: 1711000,
  滋賀県: 1402000,
  京都府: 2520000,
  大阪府: 8757000,
  兵庫県: 5337000,
  奈良県: 1285000,
  和歌山県: 880000,
  鳥取県: 531000,
  島根県: 642000,
  岡山県: 1831000,
  広島県: 2714000,
  山口県: 1281000,
  徳島県: 685000,
  香川県: 917000,
  愛媛県: 1276000,
  高知県: 656000,
  福岡県: 5092000,
  佐賀県: 788000,
  長崎県: 1252000,
  熊本県: 1697000,
  大分県: 1085000,
  宮崎県: 1033000,
  鹿児島県: 1532000,
  沖縄県: 1466000,
};

/**
 * 人口比XP（人口1万人あたりのXP）を計算
 * @param totalXp 都道府県の合計XP
 * @param prefecture 都道府県名
 * @returns 人口1万人あたりのXP（小数点2桁）
 */
export function calculateXpPerCapita(
  totalXp: number,
  prefecture: string,
): number {
  const population = PREFECTURE_POPULATIONS[prefecture];
  if (!population) return 0;
  return Math.round((totalXp / population) * 10000 * 100) / 100;
}

/**
 * 都道府県の人口を取得（万人単位）
 * @param prefecture 都道府県名
 * @returns 人口（万人単位）
 */
export function getPopulationInTenThousand(prefecture: string): number {
  const population = PREFECTURE_POPULATIONS[prefecture];
  if (!population) return 0;
  return Math.round(population / 10000);
}
