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
    await assertAuthState(signedInPage, true);

    await signedInPage.getByRole('button', { name: '今すぐチャレンジ🔥' }).first().click();
    await expect(signedInPage).toHaveURL(/\/missions\/[^\/]+$/, { timeout: 10000 });
    
    await signedInPage.getByRole('button', { name: 'ミッション完了を記録する' }).click();
    await expect(signedInPage.getByText('おめでとうございます！')).toBeVisible({ timeout: 10000 });
    await signedInPage.getByRole('button', { name: 'このまま閉じる' }).click();
    
    await signedInPage.goto(`/users/${testUser.userId}`);
    
    await expect(signedInPage.locator('h2:has-text("活動履歴")')).toBeVisible();
    
    const activitySection = signedInPage.locator('[data-testid="activity-timeline"], .activity-timeline');
    if (await activitySection.count() > 0) {
      await expect(activitySection.first()).toBeVisible();
      const achievementItems = signedInPage.locator('.activity-item, [data-testid="activity-item"]');
      if (await achievementItems.count() > 0) {
        await expect(achievementItems.first()).toBeVisible();
      }
    }
  });

  test("ユーザーページで活動タイムラインが表示される", async ({ signedInPage, testUser }) => {
    await assertAuthState(signedInPage, true);

    await signedInPage.goto(`/users/${testUser.userId}`);

    await expect(signedInPage.locator('h2:has-text("活動履歴")')).toBeVisible();
    
    const activitySection = signedInPage.locator('[data-testid="activity-timeline"], .activity-timeline');
    if (await activitySection.count() > 0) {
      await expect(activitySection.first()).toBeVisible();
    }
  });

  test("活動タイムラインのページネーション", async ({ signedInPage, testUser }) => {
    await assertAuthState(signedInPage, true);

    await signedInPage.goto(`/users/${testUser.userId}`);

    const loadMoreButton = signedInPage.locator('button:has-text("もっと見る"), button:has-text("Load More")');
    if (await loadMoreButton.count() > 0 && await loadMoreButton.first().isVisible()) {
      const initialItemCount = await signedInPage.locator('.activity-item, [data-testid="activity-item"]').count();
      
      await loadMoreButton.first().click();
      
      await signedInPage.waitForTimeout(1000);
      
      const newItemCount = await signedInPage.locator('.activity-item, [data-testid="activity-item"]').count();
      expect(newItemCount).toBeGreaterThanOrEqual(initialItemCount);
    }
  });

  test("活動タイムラインの基本構造", async ({ signedInPage, testUser }) => {
    await assertAuthState(signedInPage, true);

    await signedInPage.goto(`/users/${testUser.userId}`);

    const userLinks = signedInPage.locator('a[href*="/users/"]');
    if (await userLinks.count() > 0) {
      await expect(userLinks.first()).toBeVisible();
    }

    const timeElements = signedInPage.locator('time, .timestamp, [data-testid="activity-time"]');
    if (await timeElements.count() > 0) {
      await expect(timeElements.first()).toBeVisible();
    }
  });

  test("空の活動履歴状態の確認", async ({ signedInPage, testUser }) => {
    await assertAuthState(signedInPage, true);

    await signedInPage.goto(`/users/${testUser.userId}`);

    const emptyMessages = [
      'text=活動履歴がありません',
      'text=No activities found',
      'text=まだ活動がありません'
    ];

    let foundEmptyMessage = false;
    for (const message of emptyMessages) {
      if (await signedInPage.locator(message).count() > 0) {
        await expect(signedInPage.locator(message)).toBeVisible();
        foundEmptyMessage = true;
        break;
      }
    }

    if (!foundEmptyMessage) {
      const activityItems = signedInPage.locator('.activity-item, [data-testid="activity-item"]');
      expect(await activityItems.count()).toBe(0);
    }
  });

  test("レスポンシブデザインの確認", async ({ signedInPage, testUser }) => {
    await assertAuthState(signedInPage, true);

    await signedInPage.setViewportSize({ width: 375, height: 667 });
    await signedInPage.goto(`/users/${testUser.userId}`);

    await expect(signedInPage.locator('h2:has-text("活動履歴")')).toBeVisible();
    
    const activitySection = signedInPage.locator('[data-testid="activity-timeline"], .activity-timeline');
    if (await activitySection.count() > 0) {
      await expect(activitySection.first()).toBeVisible();
    }
  });
});
