import { assertAuthState, expect, test } from "../e2e-test-helpers";

test.describe("ポスティングマップのe2eテスト", () => {
  test("ポスティングマップ遷移が正常に動作する", async ({ signedInPage }) => {
    await assertAuthState(signedInPage, true);

    // ポスティングマップに遷移（ヘッダーメニューのリンクは非表示のためURLで直接アクセス）
    await signedInPage.goto("/map/posting");
    await expect(signedInPage).toHaveURL(/\/map\/posting/, { timeout: 10000 });
  });
});
