export type PrefectureData = {
  code: string;
  key: string;
  ja: string;
  kana: string;
};

export const PRERECTURE_CODES = [
  { code: "01", key: "hokkaido", ja: "北海道", kana: "ホッカイドウ" },
  { code: "02", key: "aomori", ja: "青森県", kana: "アオモリケン" },
  { code: "03", key: "iwate", ja: "岩手県", kana: "イワテケン" },
  { code: "04", key: "miyagi", ja: "宮城県", kana: "ミヤギケン" },
  { code: "05", key: "akita", ja: "秋田県", kana: "アキタケン" },
  { code: "06", key: "yamagata", ja: "山形県", kana: "ヤマガタケン" },
  { code: "07", key: "fukushima", ja: "福島県", kana: "フクシマケン" },
  { code: "08", key: "ibaraki", ja: "茨城県", kana: "イバラキケン" },
  { code: "09", key: "tochigi", ja: "栃木県", kana: "トチギケン" },
  { code: "10", key: "gunma", ja: "群馬県", kana: "グンマケン" },
  { code: "11", key: "saitama", ja: "埼玉県", kana: "サイタマケン" },
  { code: "12", key: "chiba", ja: "千葉県", kana: "チバケン" },
  { code: "13", key: "tokyo", ja: "東京都", kana: "トウキョウト" },
  { code: "14", key: "kanagawa", ja: "神奈川県", kana: "カナガワケン" },
  { code: "15", key: "niigata", ja: "新潟県", kana: "ニイガタケン" },
  { code: "16", key: "toyama", ja: "富山県", kana: "トヤマケン" },
  { code: "17", key: "ishikawa", ja: "石川県", kana: "イシカワケン" },
  { code: "18", key: "fukui", ja: "福井県", kana: "フクイケン" },
  { code: "19", key: "yamanashi", ja: "山梨県", kana: "ヤマナシケン" },
  { code: "20", key: "nagano", ja: "長野県", kana: "ナガノケン" },
  { code: "21", key: "gifu", ja: "岐阜県", kana: "ギフケン" },
  { code: "22", key: "shizuoka", ja: "静岡県", kana: "シズオカケン" },
  { code: "23", key: "aichi", ja: "愛知県", kana: "アイチケン" },
  { code: "24", key: "mie", ja: "三重県", kana: "ミエケン" },
  { code: "25", key: "shiga", ja: "滋賀県", kana: "シガケン" },
  { code: "26", key: "kyoto", ja: "京都府", kana: "キョウトフ" },
  { code: "27", key: "osaka", ja: "大阪府", kana: "オオサカフ" },
  { code: "28", key: "hyogo", ja: "兵庫県", kana: "ヒョウゴケン" },
  { code: "29", key: "nara", ja: "奈良県", kana: "ナラケン" },
  { code: "30", key: "wakayama", ja: "和歌山県", kana: "ワカヤマケン" },
  { code: "31", key: "tottori", ja: "鳥取県", kana: "トットリケン" },
  { code: "32", key: "shimane", ja: "島根県", kana: "シマネケン" },
  { code: "33", key: "okayama", ja: "岡山県", kana: "オカヤマケン" },
  { code: "34", key: "hiroshima", ja: "広島県", kana: "ヒロシマケン" },
  { code: "35", key: "yamaguchi", ja: "山口県", kana: "ヤマグチケン" },
  { code: "36", key: "tokushima", ja: "徳島県", kana: "トクシマケン" },
  { code: "37", key: "kagawa", ja: "香川県", kana: "カガワケン" },
  { code: "38", key: "ehime", ja: "愛媛県", kana: "エヒメケン" },
  { code: "39", key: "kochi", ja: "高知県", kana: "コウチケン" },
  { code: "40", key: "fukuoka", ja: "福岡県", kana: "フクオカケン" },
  { code: "41", key: "saga", ja: "佐賀県", kana: "サガケン" },
  { code: "42", key: "nagasaki", ja: "長崎県", kana: "ナガサキケン" },
  { code: "43", key: "kumamoto", ja: "熊本県", kana: "クマモトケン" },
  { code: "44", key: "oita", ja: "大分県", kana: "オオイタケン" },
  { code: "45", key: "miyazaki", ja: "宮崎県", kana: "ミヤザキケン" },
  { code: "46", key: "kagoshima", ja: "鹿児島県", kana: "カゴシマケン" },
  { code: "47", key: "okinawa", ja: "沖縄県", kana: "オキナワケン" },
] as const satisfies readonly PrefectureData[];

export type PREFECTURE_KEY = (typeof PRERECTURE_CODES)[number]["key"];
export type PREFECTURE_ENUM = (typeof PRERECTURE_CODES)[number]["ja"];
export const USER_PROF_PREFECTURES = PRERECTURE_CODES.map(
  (pref) => pref.ja as string,
).concat("海外");
