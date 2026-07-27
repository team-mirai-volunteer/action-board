import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/supabase";
import { saveCampaignAttribution } from "./campaign-attribution";

const createMockClient = (insertResult: { error: { code: string } | null }) => {
  const insert = jest.fn().mockResolvedValue(insertResult);
  const from = jest.fn().mockReturnValue({ insert });
  return {
    client: { from } as unknown as SupabaseClient<Database>,
    from,
    insert,
  };
};

describe("saveCampaignAttribution", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("有効なキャンペーンコードをuser_campaign_attributionに保存する", async () => {
    const { client, from, insert } = createMockClient({ error: null });

    await saveCampaignAttribution(client, "user-1", "sapporo-0730");

    expect(from).toHaveBeenCalledWith("user_campaign_attribution");
    expect(insert).toHaveBeenCalledWith({
      user_id: "user-1",
      campaign_code: "sapporo-0730",
    });
  });

  test("形式が不正なキャンペーンコードは保存しない", async () => {
    const { client, from } = createMockClient({ error: null });

    await saveCampaignAttribution(client, "user-1", "キャンペーンコード!");

    expect(from).not.toHaveBeenCalled();
  });

  test("主キー重複（同一ユーザーの2回目以降）は警告を出さず無視する", async () => {
    const { client } = createMockClient({ error: { code: "23505" } });
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    await saveCampaignAttribution(client, "user-1", "sapporo-0730");

    expect(warnSpy).not.toHaveBeenCalled();
  });

  test("その他のDBエラーは警告ログを出しつつ例外は投げない", async () => {
    const { client } = createMockClient({ error: { code: "42501" } });
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    await expect(
      saveCampaignAttribution(client, "user-1", "sapporo-0730"),
    ).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalled();
  });

  test("insertが例外を投げてもサインアップを妨げない", async () => {
    const insert = jest.fn().mockRejectedValue(new Error("network error"));
    const from = jest.fn().mockReturnValue({ insert });
    const client = { from } as unknown as SupabaseClient<Database>;
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    await expect(
      saveCampaignAttribution(client, "user-1", "sapporo-0730"),
    ).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalled();
  });
});
