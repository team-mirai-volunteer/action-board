// キャンペーンコード（キャラバン会場QR・オンラインイベント・SNSキャンペーン等の流入元計測用）の形式
// 例: sapporo-0730。英数字・ハイフン・アンダースコアの1〜50文字
const CAMPAIGN_CODE_REGEX = /^[a-zA-Z0-9_-]{1,50}$/;

export function isValidCampaignCodeFormat(campaignCode: string): boolean {
  return CAMPAIGN_CODE_REGEX.test(campaignCode);
}
