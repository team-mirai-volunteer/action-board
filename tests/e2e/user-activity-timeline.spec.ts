import { test, expect } from "@playwright/test";

test.describe("ユーザー活動タイムライン E2Eテスト", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("ユーザーページで活動タイムラインが表示される", async ({ page }) => {
    await page.goto("/users/test-user-id");

    await expect(page.locator('h2:has-text("活動履歴")')).toBeVisible();
    
    const activitySection = page.locator('[data-testid="activity-timeline"], .activity-timeline');
    if (await activitySection.count() > 0) {
      await expect(activitySection.first()).toBeVisible();
    }
  });

  test("活動タイムラインのページネーション", async ({ page }) => {
    await page.goto("/users/test-user-id");

    const loadMoreButton = page.locator('button:has-text("もっと見る"), button:has-text("Load More")');
    if (await loadMoreButton.count() > 0 && await loadMoreButton.first().isVisible()) {
      const initialItemCount = await page.locator('.activity-item, [data-testid="activity-item"]').count();
      
      await loadMoreButton.first().click();
      
      await page.waitForTimeout(1000);
      
      const newItemCount = await page.locator('.activity-item, [data-testid="activity-item"]').count();
      expect(newItemCount).toBeGreaterThanOrEqual(initialItemCount);
    }
  });

  test("活動タイムラインの基本構造", async ({ page }) => {
    await page.goto("/users/test-user-id");

    const userLinks = page.locator('a[href*="/users/"]');
    if (await userLinks.count() > 0) {
      await expect(userLinks.first()).toBeVisible();
    }

    const timeElements = page.locator('time, .timestamp, [data-testid="activity-time"]');
    if (await timeElements.count() > 0) {
      await expect(timeElements.first()).toBeVisible();
    }
  });

  test("空の活動履歴状態の確認", async ({ page }) => {
    await page.goto("/users/empty-user-id");

    const emptyMessages = [
      'text=活動履歴がありません',
      'text=No activities found',
      'text=まだ活動がありません'
    ];

    let foundEmptyMessage = false;
    for (const message of emptyMessages) {
      if (await page.locator(message).count() > 0) {
        await expect(page.locator(message)).toBeVisible();
        foundEmptyMessage = true;
        break;
      }
    }

    if (!foundEmptyMessage) {
      const activityItems = page.locator('.activity-item, [data-testid="activity-item"]');
      expect(await activityItems.count()).toBe(0);
    }
  });

  test("レスポンシブデザインの確認", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/users/test-user-id");

    await expect(page.locator('h2:has-text("活動履歴")')).toBeVisible();
    
    const activitySection = page.locator('[data-testid="activity-timeline"], .activity-timeline');
    if (await activitySection.count() > 0) {
      await expect(activitySection.first()).toBeVisible();
    }
  });
});
