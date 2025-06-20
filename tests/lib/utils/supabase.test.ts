import {
  getSupabaseAnonKey,
  getSupabaseUrl,
} from "../../../lib/utils/supabase";

describe("supabase utils", () => {
  it("Supabase URL取得の正常処理", () => {
    const url = getSupabaseUrl();
    expect(typeof url).toBe("string");
  });

  it("Supabase匿名キー取得の正常処理", () => {
    const key = getSupabaseAnonKey();
    expect(typeof key).toBe("string");
  });

  it("環境変数の存在確認", () => {
    const url = getSupabaseUrl();
    const key = getSupabaseAnonKey();
    expect(url.length).toBeGreaterThan(0);
    expect(key.length).toBeGreaterThan(0);
  });

  it("URL形式の確認", () => {
    const url = getSupabaseUrl();
    expect(url).toMatch(/^https?:\/\//);
  });
});
