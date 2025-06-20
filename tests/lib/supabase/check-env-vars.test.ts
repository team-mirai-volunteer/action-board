describe("check-env-vars", () => {
  it("環境変数チェックの正常実行", () => {
    const originalEnv = { ...process.env };
    process.env.NEXT_PUBLIC_SUPABASE_URL = "test-url";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

    jest.resetModules();
    const { hasEnvVars } = require("../../../lib/supabase/check-env-vars");

    expect(hasEnvVars).toBeTruthy();
    process.env = originalEnv;
  });

  it("環境変数不足時の処理", () => {
    const originalEnv = { ...process.env };
    process.env.NEXT_PUBLIC_SUPABASE_URL = undefined;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = undefined;

    jest.resetModules();
    const { hasEnvVars } = require("../../../lib/supabase/check-env-vars");

    expect(hasEnvVars).toBeFalsy();
    process.env = originalEnv;
  });
});
