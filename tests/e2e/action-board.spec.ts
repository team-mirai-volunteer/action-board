import {
  assertAuthState,
  expect,
  test,
} from "../e2e-test-helpers";

test.describe("アクションボード（Web版）のe2eテスト", () => {
  test("ログイン済み状態からトップページ確認", async ({
    signedInPage,
  }) => {
    await assertAuthState(signedInPage, true);

    // 自身のステータス表示を確認
    await expect(signedInPage.locator('section').getByText("安野たかひろLV.1東京都次のレベルまで40ポイント🔥")).toBeVisible();
    await expect(signedInPage.getByRole('link', { name: '安野たかひろさんのプロフィールへ' })).toBeVisible();

    // 活動状況の表示を確認
    await expect(signedInPage.getByRole('heading', { name: /チームみらいの活動状況/ })).toBeVisible();
    await expect(signedInPage.getByText("みんなで達成したアクション数")).toBeVisible();
    await expect(signedInPage.getByText('0件', { exact: true })).toBeVisible();
    await expect(signedInPage.getByText('1日で 0件')).toBeVisible();
    await expect(signedInPage.getByText("アクションボード参加者")).toBeVisible();
    await expect(signedInPage.getByText('0件', { exact: true })).toBeVisible();
    await expect(signedInPage.getByText('1日で 0件')).toBeVisible();
    
    // ランキングの表示を確認
    await expect(signedInPage.getByRole('heading', { name: /アクションリーダートップ5/ })).toBeVisible();
    await expect(signedInPage.getByRole('link', { name: /安野たかひろ 東京都 Lv.20 3,325pt/ })).toBeVisible();
    await expect(signedInPage.getByRole('link', { name: /佐藤太郎 東京都 Lv.10 900pt/ })).toBeVisible();
    await expect(signedInPage.getByRole('link', { name: /鈴木美咲 神奈川県 Lv.9 740pt/ })).toBeVisible();
    await expect(signedInPage.getByRole('link', { name: /高橋健一 大阪府 Lv.8 595pt/ })).toBeVisible();
    await expect(signedInPage.getByRole('link', { name: /伊藤愛子 愛知県 Lv.7 465pt/ })).toBeVisible();
    await expect(signedInPage.getByRole('link', { name: 'トップ100を見る' })).toBeVisible();

    // 重要ミッションの表示を確認
    await expect(signedInPage.getByRole('heading', { name: /重要ミッション/ })).toBeVisible();
    await expect(signedInPage.getByText("(seed) ゴミ拾いをしよう (成果物不要)")).toBeVisible();
    await expect(signedInPage.getByText('みんなで0回達成難易度: ⭐', { exact: true })).toBeVisible();
    await expect(signedInPage.getByText("(seed) 発見！地域の宝 (位置情報付き画像)")).toBeVisible();
    await expect(signedInPage.getByText('みんなで0回達成難易度: ⭐⭐⭐⭐', { exact: true })).toBeVisible();
    
    // TODO - seedの投入が必要
    // ミッションの表示を確認

    // TODO - seedの投入が必要
    // 活動タイムラインの表示を確認
    await expect(signedInPage.getByRole('heading', { name: /活動タイムライン/ })).toBeVisible();
    await expect(signedInPage.getByText("リアルタイムで更新される活動記録")).toBeVisible();

    // 問い合わせフォームの表示を確認
    await expect(signedInPage.getByRole('heading', { name: /ご意見をお聞かせください/ })).toBeVisible();
    await expect(signedInPage.getByText("チームみらいアクションボードをより良いサービスにするため、 皆様のご意見・ご要望をお聞かせください。 いただいたフィードバックは今後の改善に活用させていただきます。")).toBeVisible();
    await expect(signedInPage.getByRole('link', { name: 'ご意見箱を開く' })).toBeVisible();
  });

  test("アカウントページ遷移が正常に動作する", async ({
    signedInPage,
  }) => {
    await assertAuthState(signedInPage, true);

    // アカウントページに遷移
    await signedInPage.getByTestId("usermenubutton").click();
    await signedInPage.getByText("アカウント").click();
    await expect(signedInPage).toHaveURL(/\/settings\/profile/, { timeout: 10000 });

    // アカウントページの表示内容を確認
    await expect(signedInPage.getByText("プロフィール設定")).toBeVisible();
    await expect(signedInPage.getByText("ニックネーム")).toBeVisible();
    await expect(signedInPage.getByText("生年月日")).toBeVisible();
    await expect(signedInPage.getByText("都道府県")).toBeVisible();
    await expect(signedInPage.getByText("生年月日")).toBeVisible();
    await expect(signedInPage.getByText("X(旧Twitter)のユーザー名")).toBeVisible();
    await expect(signedInPage.getByText("GitHubのユーザー名", { exact: true })).toBeVisible();
    await expect(signedInPage.getByRole("button", { name: "更新する" })).toBeVisible();
  });

  test("ユーザーページ遷移が正常に動作する", async ({
    signedInPage,
  }) => {
    await assertAuthState(signedInPage, true);
    // TODO
    // 自身のユーザーページに遷移
    // 自身のユーザーページの表示内容を確認
  });

  test("任意のユーザーページ遷移が正常に動作する", async ({
    signedInPage,
  }) => {
    await assertAuthState(signedInPage, true);
    // TODO
    // 任意のユーザーページに遷移
    // 任意のユーザーページの表示内容を確認
  });

  test("ミッションページ遷移が正常に動作する", async ({
    signedInPage,
  }) => {
    await assertAuthState(signedInPage, true);
    // TODO
    // ミッションページに遷移
    // ミッションページの表示内容を確認
  });
});
