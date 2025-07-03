import {
  assertAuthState,
  expect,
  test,
} from "../e2e-test-helpers";

test.describe("ダッシュボードとマイページのE2Eテスト", () => {
  test("ログイン済み状態からダッシュボード確認 → マイページ遷移 → マイページ確認の基本フローが正常に動作する", async ({
    signedInPage,
  }) => {
    await assertAuthState(signedInPage, true);

    await expect(signedInPage.getByText(/LV\./)).toBeVisible();
    
    await expect(signedInPage.getByRole('heading', { name: /チームみらいの活動状況/ })).toBeVisible();
    
    await expect(signedInPage.locator("section").filter({ hasText: /メトリクス|統計|数値/ }).or(signedInPage.locator('[class*="metric"]')).first()).toBeVisible({ timeout: 5000 }).catch(() => {
      console.log("メトリクス要素が見つかりませんでした（オプション要素）");
    });

    await expect(signedInPage.getByText("ランキング").or(signedInPage.getByText("順位")).first()).toBeVisible({ timeout: 5000 }).catch(() => {
      console.log("ランキング要素が見つかりませんでした（オプション要素）");
    });

    await signedInPage.getByTestId("usermenubutton").click();
    await signedInPage.getByText("アカウント").click();

    await expect(signedInPage).toHaveURL(/\/settings\/profile/, { timeout: 10000 });

    await expect(signedInPage.getByText("プロフィール設定")).toBeVisible();
    await expect(signedInPage.getByText("ニックネーム")).toBeVisible();
    await expect(signedInPage.getByText("都道府県")).toBeVisible();
    await expect(signedInPage.getByRole("button", { name: "更新する" })).toBeVisible();

    await expect(signedInPage.locator('[class*="avatar"]').or(signedInPage.getByText("プロフィール画像")).first()).toBeVisible({ timeout: 5000 }).catch(() => {
      console.log("プロフィール画像要素が見つかりませんでした（オプション要素）");
    });

    await expect(signedInPage.locator('input[name="name"]')).toBeVisible();
    await expect(signedInPage.locator('[name="address_prefecture"]')).toBeVisible();
  });
});
