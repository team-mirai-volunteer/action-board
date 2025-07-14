// 政令指定都市の区マスターデータ
// Looker Studioのcity_masterクエリと同じデータ構造

export interface DesignatedCityWard {
  prefecture: string;
  city: string;
  ward: string;
}

export const designatedCityWards: DesignatedCityWard[] = [
  // 北海道
  { prefecture: "北海道", city: "札幌市", ward: "中央区" },
  { prefecture: "北海道", city: "札幌市", ward: "北区" },
  { prefecture: "北海道", city: "札幌市", ward: "東区" },
  { prefecture: "北海道", city: "札幌市", ward: "白石区" },
  { prefecture: "北海道", city: "札幌市", ward: "豊平区" },
  { prefecture: "北海道", city: "札幌市", ward: "南区" },
  { prefecture: "北海道", city: "札幌市", ward: "西区" },
  { prefecture: "北海道", city: "札幌市", ward: "厚別区" },
  { prefecture: "北海道", city: "札幌市", ward: "手稲区" },
  { prefecture: "北海道", city: "札幌市", ward: "清田区" },

  // 宮城県
  { prefecture: "宮城県", city: "仙台市", ward: "青葉区" },
  { prefecture: "宮城県", city: "仙台市", ward: "宮城野区" },
  { prefecture: "宮城県", city: "仙台市", ward: "若林区" },
  { prefecture: "宮城県", city: "仙台市", ward: "太白区" },
  { prefecture: "宮城県", city: "仙台市", ward: "泉区" },

  // 埼玉県
  { prefecture: "埼玉県", city: "さいたま市", ward: "西区" },
  { prefecture: "埼玉県", city: "さいたま市", ward: "北区" },
  { prefecture: "埼玉県", city: "さいたま市", ward: "大宮区" },
  { prefecture: "埼玉県", city: "さいたま市", ward: "見沼区" },
  { prefecture: "埼玉県", city: "さいたま市", ward: "中央区" },
  { prefecture: "埼玉県", city: "さいたま市", ward: "桜区" },
  { prefecture: "埼玉県", city: "さいたま市", ward: "浦和区" },
  { prefecture: "埼玉県", city: "さいたま市", ward: "南区" },
  { prefecture: "埼玉県", city: "さいたま市", ward: "緑区" },
  { prefecture: "埼玉県", city: "さいたま市", ward: "岩槻区" },

  // 千葉県
  { prefecture: "千葉県", city: "千葉市", ward: "中央区" },
  { prefecture: "千葉県", city: "千葉市", ward: "花見川区" },
  { prefecture: "千葉県", city: "千葉市", ward: "稲毛区" },
  { prefecture: "千葉県", city: "千葉市", ward: "若葉区" },
  { prefecture: "千葉県", city: "千葉市", ward: "緑区" },
  { prefecture: "千葉県", city: "千葉市", ward: "美浜区" },

  // 神奈川県
  { prefecture: "神奈川県", city: "横浜市", ward: "鶴見区" },
  { prefecture: "神奈川県", city: "横浜市", ward: "神奈川区" },
  { prefecture: "神奈川県", city: "横浜市", ward: "西区" },
  { prefecture: "神奈川県", city: "横浜市", ward: "中区" },
  { prefecture: "神奈川県", city: "横浜市", ward: "南区" },
  { prefecture: "神奈川県", city: "横浜市", ward: "保土ケ谷区" },
  { prefecture: "神奈川県", city: "横浜市", ward: "磯子区" },
  { prefecture: "神奈川県", city: "横浜市", ward: "金沢区" },
  { prefecture: "神奈川県", city: "横浜市", ward: "港北区" },
  { prefecture: "神奈川県", city: "横浜市", ward: "戸塚区" },
  { prefecture: "神奈川県", city: "横浜市", ward: "港南区" },
  { prefecture: "神奈川県", city: "横浜市", ward: "旭区" },
  { prefecture: "神奈川県", city: "横浜市", ward: "緑区" },
  { prefecture: "神奈川県", city: "横浜市", ward: "瀬谷区" },
  { prefecture: "神奈川県", city: "横浜市", ward: "栄区" },
  { prefecture: "神奈川県", city: "横浜市", ward: "泉区" },
  { prefecture: "神奈川県", city: "横浜市", ward: "青葉区" },
  { prefecture: "神奈川県", city: "横浜市", ward: "都筑区" },
  { prefecture: "神奈川県", city: "川崎市", ward: "川崎区" },
  { prefecture: "神奈川県", city: "川崎市", ward: "幸区" },
  { prefecture: "神奈川県", city: "川崎市", ward: "中原区" },
  { prefecture: "神奈川県", city: "川崎市", ward: "高津区" },
  { prefecture: "神奈川県", city: "川崎市", ward: "多摩区" },
  { prefecture: "神奈川県", city: "川崎市", ward: "宮前区" },
  { prefecture: "神奈川県", city: "川崎市", ward: "麻生区" },
  { prefecture: "神奈川県", city: "相模原市", ward: "緑区" },
  { prefecture: "神奈川県", city: "相模原市", ward: "中央区" },
  { prefecture: "神奈川県", city: "相模原市", ward: "南区" },

  // 新潟県
  { prefecture: "新潟県", city: "新潟市", ward: "北区" },
  { prefecture: "新潟県", city: "新潟市", ward: "東区" },
  { prefecture: "新潟県", city: "新潟市", ward: "中央区" },
  { prefecture: "新潟県", city: "新潟市", ward: "江南区" },
  { prefecture: "新潟県", city: "新潟市", ward: "秋葉区" },
  { prefecture: "新潟県", city: "新潟市", ward: "南区" },
  { prefecture: "新潟県", city: "新潟市", ward: "西区" },
  { prefecture: "新潟県", city: "新潟市", ward: "西蒲区" },

  // 静岡県
  { prefecture: "静岡県", city: "静岡市", ward: "葵区" },
  { prefecture: "静岡県", city: "静岡市", ward: "駿河区" },
  { prefecture: "静岡県", city: "静岡市", ward: "清水区" },
  { prefecture: "静岡県", city: "浜松市", ward: "中央区" },
  { prefecture: "静岡県", city: "浜松市", ward: "浜名区" },
  { prefecture: "静岡県", city: "浜松市", ward: "天竜区" },

  // 愛知県
  { prefecture: "愛知県", city: "名古屋市", ward: "千種区" },
  { prefecture: "愛知県", city: "名古屋市", ward: "東区" },
  { prefecture: "愛知県", city: "名古屋市", ward: "北区" },
  { prefecture: "愛知県", city: "名古屋市", ward: "西区" },
  { prefecture: "愛知県", city: "名古屋市", ward: "中村区" },
  { prefecture: "愛知県", city: "名古屋市", ward: "中区" },
  { prefecture: "愛知県", city: "名古屋市", ward: "昭和区" },
  { prefecture: "愛知県", city: "名古屋市", ward: "瑞穂区" },
  { prefecture: "愛知県", city: "名古屋市", ward: "熱田区" },
  { prefecture: "愛知県", city: "名古屋市", ward: "中川区" },
  { prefecture: "愛知県", city: "名古屋市", ward: "港区" },
  { prefecture: "愛知県", city: "名古屋市", ward: "南区" },
  { prefecture: "愛知県", city: "名古屋市", ward: "守山区" },
  { prefecture: "愛知県", city: "名古屋市", ward: "緑区" },
  { prefecture: "愛知県", city: "名古屋市", ward: "名東区" },
  { prefecture: "愛知県", city: "名古屋市", ward: "天白区" },

  // 京都府
  { prefecture: "京都府", city: "京都市", ward: "北区" },
  { prefecture: "京都府", city: "京都市", ward: "上京区" },
  { prefecture: "京都府", city: "京都市", ward: "左京区" },
  { prefecture: "京都府", city: "京都市", ward: "中京区" },
  { prefecture: "京都府", city: "京都市", ward: "東山区" },
  { prefecture: "京都府", city: "京都市", ward: "下京区" },
  { prefecture: "京都府", city: "京都市", ward: "南区" },
  { prefecture: "京都府", city: "京都市", ward: "右京区" },
  { prefecture: "京都府", city: "京都市", ward: "伏見区" },
  { prefecture: "京都府", city: "京都市", ward: "山科区" },
  { prefecture: "京都府", city: "京都市", ward: "西京区" },

  // 大阪府
  { prefecture: "大阪府", city: "大阪市", ward: "都島区" },
  { prefecture: "大阪府", city: "大阪市", ward: "福島区" },
  { prefecture: "大阪府", city: "大阪市", ward: "此花区" },
  { prefecture: "大阪府", city: "大阪市", ward: "西区" },
  { prefecture: "大阪府", city: "大阪市", ward: "港区" },
  { prefecture: "大阪府", city: "大阪市", ward: "大正区" },
  { prefecture: "大阪府", city: "大阪市", ward: "天王寺区" },
  { prefecture: "大阪府", city: "大阪市", ward: "浪速区" },
  { prefecture: "大阪府", city: "大阪市", ward: "西淀川区" },
  { prefecture: "大阪府", city: "大阪市", ward: "東淀川区" },
  { prefecture: "大阪府", city: "大阪市", ward: "東成区" },
  { prefecture: "大阪府", city: "大阪市", ward: "生野区" },
  { prefecture: "大阪府", city: "大阪市", ward: "旭区" },
  { prefecture: "大阪府", city: "大阪市", ward: "城東区" },
  { prefecture: "大阪府", city: "大阪市", ward: "阿倍野区" },
  { prefecture: "大阪府", city: "大阪市", ward: "住吉区" },
  { prefecture: "大阪府", city: "大阪市", ward: "東住吉区" },
  { prefecture: "大阪府", city: "大阪市", ward: "西成区" },
  { prefecture: "大阪府", city: "大阪市", ward: "淀川区" },
  { prefecture: "大阪府", city: "大阪市", ward: "鶴見区" },
  { prefecture: "大阪府", city: "大阪市", ward: "住之江区" },
  { prefecture: "大阪府", city: "大阪市", ward: "平野区" },
  { prefecture: "大阪府", city: "大阪市", ward: "北区" },
  { prefecture: "大阪府", city: "大阪市", ward: "中央区" },
  { prefecture: "大阪府", city: "堺市", ward: "堺区" },
  { prefecture: "大阪府", city: "堺市", ward: "中区" },
  { prefecture: "大阪府", city: "堺市", ward: "東区" },
  { prefecture: "大阪府", city: "堺市", ward: "西区" },
  { prefecture: "大阪府", city: "堺市", ward: "南区" },
  { prefecture: "大阪府", city: "堺市", ward: "北区" },
  { prefecture: "大阪府", city: "堺市", ward: "美原区" },

  // 兵庫県
  { prefecture: "兵庫県", city: "神戸市", ward: "東灘区" },
  { prefecture: "兵庫県", city: "神戸市", ward: "灘区" },
  { prefecture: "兵庫県", city: "神戸市", ward: "兵庫区" },
  { prefecture: "兵庫県", city: "神戸市", ward: "長田区" },
  { prefecture: "兵庫県", city: "神戸市", ward: "須磨区" },
  { prefecture: "兵庫県", city: "神戸市", ward: "垂水区" },
  { prefecture: "兵庫県", city: "神戸市", ward: "北区" },
  { prefecture: "兵庫県", city: "神戸市", ward: "中央区" },
  { prefecture: "兵庫県", city: "神戸市", ward: "西区" },

  // 岡山県
  { prefecture: "岡山県", city: "岡山市", ward: "北区" },
  { prefecture: "岡山県", city: "岡山市", ward: "中区" },
  { prefecture: "岡山県", city: "岡山市", ward: "東区" },
  { prefecture: "岡山県", city: "岡山市", ward: "南区" },

  // 広島県
  { prefecture: "広島県", city: "広島市", ward: "中区" },
  { prefecture: "広島県", city: "広島市", ward: "東区" },
  { prefecture: "広島県", city: "広島市", ward: "南区" },
  { prefecture: "広島県", city: "広島市", ward: "西区" },
  { prefecture: "広島県", city: "広島市", ward: "安佐南区" },
  { prefecture: "広島県", city: "広島市", ward: "安佐北区" },
  { prefecture: "広島県", city: "広島市", ward: "安芸区" },
  { prefecture: "広島県", city: "広島市", ward: "佐伯区" },

  // 福岡県
  { prefecture: "福岡県", city: "北九州市", ward: "門司区" },
  { prefecture: "福岡県", city: "北九州市", ward: "若松区" },
  { prefecture: "福岡県", city: "北九州市", ward: "戸畑区" },
  { prefecture: "福岡県", city: "北九州市", ward: "小倉北区" },
  { prefecture: "福岡県", city: "北九州市", ward: "小倉南区" },
  { prefecture: "福岡県", city: "北九州市", ward: "八幡東区" },
  { prefecture: "福岡県", city: "北九州市", ward: "八幡西区" },
  { prefecture: "福岡県", city: "福岡市", ward: "東区" },
  { prefecture: "福岡県", city: "福岡市", ward: "博多区" },
  { prefecture: "福岡県", city: "福岡市", ward: "中央区" },
  { prefecture: "福岡県", city: "福岡市", ward: "南区" },
  { prefecture: "福岡県", city: "福岡市", ward: "西区" },
  { prefecture: "福岡県", city: "福岡市", ward: "城南区" },
  { prefecture: "福岡県", city: "福岡市", ward: "早良区" },

  // 熊本県
  { prefecture: "熊本県", city: "熊本市", ward: "中央区" },
  { prefecture: "熊本県", city: "熊本市", ward: "東区" },
  { prefecture: "熊本県", city: "熊本市", ward: "西区" },
  { prefecture: "熊本県", city: "熊本市", ward: "南区" },
  { prefecture: "熊本県", city: "熊本市", ward: "北区" },
];

/**
 * 政令指定都市かどうかを判定する
 */
export function isDesignatedCity(prefecture: string, city: string): boolean {
  return designatedCityWards.some(
    (ward) => ward.prefecture === prefecture && ward.city === city,
  );
}

/**
 * 住所から政令指定都市の区を抽出する
 * Looker Studioと同じ判別ロジックを使用
 */
export function extractWardFromAddress(
  prefecture: string,
  city: string,
  address: string,
  hasPersonalName = false,
): string {
  // 政令指定都市でない場合は何もしない
  if (!isDesignatedCity(prefecture, city)) {
    return address;
  }

  // 該当する政令指定都市の区を検索
  const cityWards = designatedCityWards.filter(
    (ward) => ward.prefecture === prefecture && ward.city === city,
  );

  for (const wardInfo of cityWards) {
    const ward = wardInfo.ward;

    // Looker Studioと同じ判別ロジック
    // STARTS_WITH(pb.address, cm.ward)
    // OR STARTS_WITH(pb.address, CONCAT(cm.city, cm.ward))
    // OR REGEXP_CONTAINS(pb.address, CONCAT('^[^区]*', cm.ward))
    if (
      address.startsWith(ward) ||
      address.startsWith(city + ward) ||
      new RegExp(`^[^区]*${ward}`).test(address)
    ) {
      return ward;
    }
  }

  // 区が特定できない場合：個人名がある場合のみmasked、ない場合はそのまま返す
  return hasPersonalName ? "masked" : address;
}
