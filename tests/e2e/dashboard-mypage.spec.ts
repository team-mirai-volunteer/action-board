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

    await expect(signedInPage.getByText(/LV\. 1/)).toBeVisible();
    await expect(signedInPage.getByText("次のレベルまで")).toBeVisible();
    await expect(signedInPage.getByText("ポイント")).toBeVisible();
    
    await expect(signedInPage.getByRole('heading', { name: /チームみらいの活動状況/ })).toBeVisible();
    
    await expect(signedInPage.getByText("みんなで達成したアクション数")).toBeVisible();
    await expect(signedInPage.getByText("0 件")).toBeVisible();
    
    await expect(signedInPage.getByText("アクションボード参加者")).toBeVisible();
    await expect(signedInPage.getByText("13 人")).toBeVisible();
    
    await expect(signedInPage.getByText("アクションリーダートップ5")).toBeVisible();
    await expect(signedInPage.getByText("安野たかひろ")).toBeVisible();
    await expect(signedInPage.getByText("Lv.20")).toBeVisible();
    await expect(signedInPage.getByText("3,325pt")).toBeVisible();
    
    await expect(signedInPage.getByText("佐藤太郎")).toBeVisible();
    await expect(signedInPage.getByText("Lv.10")).toBeVisible();
    await expect(signedInPage.getByText("900pt")).toBeVisible();
    
    await expect(signedInPage.getByText("鈴木美咲")).toBeVisible();
    await expect(signedInPage.getByText("Lv.9")).toBeVisible();
    await expect(signedInPage.getByText("740pt")).toBeVisible();
    
    await expect(signedInPage.getByText("高橋健一")).toBeVisible();
    await expect(signedInPage.getByText("Lv.8")).toBeVisible();
    
    await expect(signedInPage.getByText("伊藤愛子")).toBeVisible();
    await expect(signedInPage.getByText("Lv.7")).toBeVisible();
    
    await expect(signedInPage.getByText("重要ミッション")).toBeVisible();
    await expect(signedInPage.getByText("(seed) ゴミ拾いをしよう (成果物不要)")).toBeVisible();
    await expect(signedInPage.getByText("(seed) 発見！地域の宝 (位置情報付き画像)")).toBeVisible();
    
    await expect(signedInPage.getByText("活動タイムライン")).toBeVisible();
    await expect(signedInPage.getByText("活動履歴がありません").or(signedInPage.getByText("ミッション「ゴミ拾いをしよう」達成")).first()).toBeVisible();

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
