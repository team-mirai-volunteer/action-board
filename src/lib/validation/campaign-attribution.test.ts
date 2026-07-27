import { isValidCampaignCodeFormat } from "./campaign-attribution";

describe("isValidCampaignCodeFormat", () => {
  test("英数字・ハイフン・アンダースコアの1〜50文字を許可する", () => {
    expect(isValidCampaignCodeFormat("sapporo-0730")).toBe(true);
    expect(isValidCampaignCodeFormat("cv_sap01")).toBe(true);
    expect(isValidCampaignCodeFormat("A1")).toBe(true);
    expect(isValidCampaignCodeFormat("a".repeat(50))).toBe(true);
  });

  test("空文字・51文字以上・記号・日本語を拒否する", () => {
    expect(isValidCampaignCodeFormat("")).toBe(false);
    expect(isValidCampaignCodeFormat("a".repeat(51))).toBe(false);
    expect(isValidCampaignCodeFormat("sapporo 0730")).toBe(false);
    expect(isValidCampaignCodeFormat("札幌")).toBe(false);
    expect(isValidCampaignCodeFormat("sap<script>")).toBe(false);
    expect(isValidCampaignCodeFormat("a/b")).toBe(false);
  });
});
