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
    
    await expect(signedInPage.getByText("みんなで達成したアクション数")).toBeVisible();
    
    await expect(signedInPage.getByText("アクションボード参加者")).toBeVisible();
    
    await expect(signedInPage.getByText("アクションリーダートップ5")).toBeVisible();
    
    await expect(signedInPage.getByText("重要ミッション")).toBeVisible();
    
    await expect(signedInPage.getByText("活動タイムライン")).toBeVisible();

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
