import {
  createClient,
  createServiceClient,
} from "../../../lib/supabase/server";

describe("Supabase Server", () => {
  it("サーバークライアント作成の正常処理", () => {
    const client = createClient();
    expect(client).toBeDefined();
  });

  it("サービスクライアント作成の正常処理", () => {
    const client = createServiceClient();
    expect(client).toBeDefined();
  });
});
