/**
 * ユーザー活動タイムライン E2Eテスト
 * 
 * このテストファイルは以下のユーザー体験を検証します：
 * - 活動タイムラインページの正常表示
 * - ページネーション機能の動作確認
 * - レスポンシブデザインの動作確認
 * - エラー状態の適切な処理
 * - 実際のブラウザ環境での動作確認
 * 
 * E2Eテストの目的: ユーザーが実際にブラウザで操作する際の
 * 体験が期待通りに動作することを保証する
 */
import { test, expect } from "../e2e-test-helpers";
import { assertAuthState } from "../e2e-test-helpers";

test.describe("ユーザー活動タイムライン E2Eテスト", () => {
  test("活動タイムラインにテストデータを作成してから表示確認", async ({ signedInPage, testUser }) => {
    test.setTimeout(120000);
    await assertAuthState(signedInPage, true);

    await signedInPage.goto(`/users/${testUser.userId}`, { timeout: 60000 });
    await expect(signedInPage.locator('span:has-text("活動タイムライン")')).toBeVisible();
    await expect(signedInPage.locator('text=活動履歴がありません')).toBeVisible();

    await signedInPage.goto('/', { timeout: 60000 });
    await signedInPage.goto('/missions/e2898d7e-903f-4f9a-8b1b-93f783c9afac', { timeout: 60000 });
    await expect(signedInPage).toHaveURL(/\/missions\/[^\/]+$/, { timeout: 20000 });
    
    await signedInPage.getByRole('button', { name: 'ミッション完了を記録する' }).click();
    await expect(signedInPage.getByText('おめでとうございます！')).toBeVisible({ timeout: 20000 });
    await signedInPage.getByRole('button', { name: 'このまま閉じる' }).click();
    
    await signedInPage.goto(`/users/${testUser.userId}`, { timeout: 60000 });
    
    await expect(signedInPage.locator('span:has-text("活動タイムライン")')).toBeVisible();
    
    await expect(signedInPage.locator('text=活動履歴がありません')).not.toBeVisible();
    
    const activityItems = signedInPage.locator('div.flex.flex-row.gap-2.items-center');
    await expect(activityItems.first()).toBeVisible();
    
    await expect(signedInPage.locator('text=を達成しました！')).toBeVisible();
  });

  test("ユーザーページで活動タイムラインが表示される", async ({ signedInPage, testUser }) => {
    await assertAuthState(signedInPage, true);

    await signedInPage.goto(`/users/${testUser.userId}`, { timeout: 60000 });

    await expect(signedInPage.locator('span:has-text("活動タイムライン")')).toBeVisible();
    
    const timelineSection = signedInPage.locator('div.flex.flex-col.gap-4');
    await expect(timelineSection.first()).toBeVisible();
  });

  test("活動タイムラインのページネーション", async ({ signedInPage, testUser }) => {
    await assertAuthState(signedInPage, true);

    await signedInPage.goto(`/users/${testUser.userId}`, { timeout: 60000 });

    const loadMoreButton = signedInPage.locator('button:has-text("もっと見る")');
    if (await loadMoreButton.count() > 0 && await loadMoreButton.first().isVisible()) {
      const initialItemCount = await signedInPage.locator('div.flex.flex-row.gap-2.items-center').count();
      
      await loadMoreButton.first().click();
      
      await signedInPage.waitForTimeout(1000);
      
      const newItemCount = await signedInPage.locator('div.flex.flex-row.gap-2.items-center').count();
      expect(newItemCount).toBeGreaterThanOrEqual(initialItemCount);
    }
  });

  test("活動タイムラインの基本構造", async ({ signedInPage, testUser }) => {
    await assertAuthState(signedInPage, true);

    await signedInPage.goto(`/users/${testUser.userId}`, { timeout: 60000 });

    const userLinks = signedInPage.locator('a[href*="/users/"]');
    if (await userLinks.count() > 0) {
      await expect(userLinks.first()).toBeVisible();
    }

    const activityItems = signedInPage.locator('div.flex.flex-row.gap-2.items-center');
    if (await activityItems.count() > 0) {
      const timeElements = signedInPage.locator('div.text-xs.text-gray-500');
      await expect(timeElements.first()).toBeVisible();
    }
  });

  test("空の活動履歴状態の確認", async ({ signedInPage, testUser }) => {
    await assertAuthState(signedInPage, true);

    await signedInPage.goto(`/users/${testUser.userId}`, { timeout: 60000 });

    await expect(signedInPage.locator('text=活動履歴がありません')).toBeVisible();
  });

  test("レスポンシブデザインの確認", async ({ signedInPage, testUser }) => {
    await assertAuthState(signedInPage, true);

    await signedInPage.setViewportSize({ width: 375, height: 667 });
    await signedInPage.goto(`/users/${testUser.userId}`, { timeout: 60000 });

    await expect(signedInPage.locator('span:has-text("活動タイムライン")')).toBeVisible();
    
    const timelineSection = signedInPage.locator('div.flex.flex-col.gap-4');
    await expect(timelineSection.first()).toBeVisible();
  });

  test("ユーザー自身の活動タイムラインが他ユーザーの大量データに影響されずに表示される", async ({ signedInPage, testUser, browser }) => {
    test.setTimeout(300000);
    await assertAuthState(signedInPage, true);

    await signedInPage.goto('/missions/e2898d7e-903f-4f9a-8b1b-93f783c9afac', { timeout: 60000 });
    await expect(signedInPage).toHaveURL(/\/missions\/[^\/]+$/, { timeout: 60000 });
    
    await signedInPage.getByRole('button', { name: 'ミッション完了を記録する' }).click();
    await expect(signedInPage.getByText('おめでとうございます！')).toBeVisible({ timeout: 60000 });
    await signedInPage.getByRole('button', { name: 'このまま閉じる' }).click();
    
    await signedInPage.goto(`/users/${testUser.userId}`, { timeout: 60000 });
    await expect(signedInPage.locator('span:has-text("活動タイムライン")')).toBeVisible();
    await expect(signedInPage.locator('text=活動履歴がありません')).not.toBeVisible();
    
    const userAActivityItems = signedInPage.locator('div.flex.flex-row.gap-2.items-center');
    await expect(userAActivityItems.first()).toBeVisible();
    await expect(signedInPage.locator('text=を達成しました！')).toBeVisible();
    
    const userBContext = await browser.newContext();
    const userBPage = await userBContext.newPage();
    
    await userBPage.goto('/sign-up', { timeout: 60000 });
    
    await userBPage.selectOption('select[name="year_select"]', '1990');
    await userBPage.selectOption('select[name="month_select"]', '1');
    await userBPage.selectOption('select[name="day_select"]', '1');
    await userBPage.check('input[id="terms"]');
    await userBPage.click('button:has-text("次へ進む")');
    
    await userBPage.click('button:has-text("メールアドレスとパスワードで作成")');
    await userBPage.waitForURL('/sign-up-email', { timeout: 60000 });
    
    const userBEmail = `test-user-b-${Date.now()}@example.com`;
    await userBPage.fill('input[name="email"]', userBEmail, { timeout: 60000 });
    await userBPage.fill('input[name="password"]', 'testpassword123', { timeout: 60000 });
    await userBPage.click('button[type="submit"]');
    
    for (let i = 0; i < 55; i++) {
      await userBPage.goto('/missions/e2898d7e-903f-4f9a-8b1b-93f783c9afac', { timeout: 60000 });
      await expect(userBPage).toHaveURL(/\/missions\/[^\/]+$/, { timeout: 60000 });
      
      await userBPage.getByRole('button', { name: 'ミッション完了を記録する' }).click();
      await expect(userBPage.getByText('おめでとうございます！')).toBeVisible({ timeout: 60000 });
      await userBPage.getByRole('button', { name: 'このまま閉じる' }).click();
      
      if ((i + 1) % 10 === 0) {
        console.log(`ユーザーBのミッション達成データ作成進捗: ${i + 1}/55件完了`);
      }
    }
    
    await userBContext.close();
    
    await signedInPage.goto(`/users/${testUser.userId}`, { timeout: 60000 });
    
    await expect(signedInPage.locator('span:has-text("活動タイムライン")')).toBeVisible();
    await expect(signedInPage.locator('text=活動履歴がありません')).not.toBeVisible();
    
    const activityItems = signedInPage.locator('div.flex.flex-row.gap-2.items-center');
    await expect(activityItems.first()).toBeVisible();
    await expect(signedInPage.locator('text=を達成しました！')).toBeVisible();
    
    const itemCount = await activityItems.count();
    expect(itemCount).toBeGreaterThan(0);
    
  });
});
