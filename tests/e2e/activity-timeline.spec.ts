import {
  assertAuthState,
  expect,
  test,
} from '../e2e-test-helpers';

test.describe('活動タイムライン E2E テスト', () => {
  test('トップページの活動タイムライン表示確認', async ({
    signedInPage,
  }) => {
    await assertAuthState(signedInPage, true);

    await signedInPage.locator('section').filter({ hasText: '活動タイムライン' }).scrollIntoViewIfNeeded();

    // 活動タイムラインの表示を確認
    await expect(signedInPage.getByRole('heading', { name: /活動タイムライン/ })).toBeVisible();
    await expect(signedInPage.getByText('リアルタイムで更新される活動記録')).toBeVisible();

    const timelineCard = signedInPage.locator('.border-2.border-gray-200.rounded-2xl');
    await expect(timelineCard).toBeVisible();
  });

  test('活動タイムラインのページネーション機能', async ({
    signedInPage,
  }) => {
    await assertAuthState(signedInPage, true);

    await signedInPage.locator('section').filter({ hasText: '活動タイムライン' }).scrollIntoViewIfNeeded();

    const loadMoreButton = signedInPage.getByRole('button', { name: 'もっと見る' });
    
    if (await loadMoreButton.isVisible()) {
      const initialActivities = await signedInPage.locator('.flex.flex-row.gap-2.items-center').count();
      
      await loadMoreButton.click();
      
      await expect(signedInPage.getByText('読み込み中...')).toBeVisible({ timeout: 5000 });
      
      await expect(signedInPage.getByText('読み込み中...')).not.toBeVisible({ timeout: 10000 });
      
      const newActivities = await signedInPage.locator('.flex.flex-row.gap-2.items-center').count();
      expect(newActivities).toBeGreaterThanOrEqual(initialActivities);
    }
  });

  test('活動タイムラインのレスポンシブデザイン', async ({
    signedInPage,
  }) => {
    await assertAuthState(signedInPage, true);

    await signedInPage.setViewportSize({ width: 1200, height: 800 });
    await signedInPage.locator('section').filter({ hasText: '活動タイムライン' }).scrollIntoViewIfNeeded();
    
    const desktopHeading = signedInPage.getByRole('heading', { name: /活動タイムライン/ });
    await expect(desktopHeading).toBeVisible();
    
    await signedInPage.setViewportSize({ width: 375, height: 667 });
    await signedInPage.locator('section').filter({ hasText: '活動タイムライン' }).scrollIntoViewIfNeeded();
    
    const mobileHeading = signedInPage.getByRole('heading', { name: /活動タイムライン/ });
    await expect(mobileHeading).toBeVisible();
    
    await signedInPage.setViewportSize({ width: 768, height: 1024 });
    await signedInPage.locator('section').filter({ hasText: '活動タイムライン' }).scrollIntoViewIfNeeded();
    
    const tabletHeading = signedInPage.getByRole('heading', { name: /活動タイムライン/ });
    await expect(tabletHeading).toBeVisible();
  });

  test('活動タイムラインのエラーハンドリング', async ({
    signedInPage,
  }) => {
    await assertAuthState(signedInPage, true);

    await signedInPage.route('**/activity_timeline_view*', route => {
      route.abort('failed');
    });

    await signedInPage.locator('section').filter({ hasText: '活動タイムライン' }).scrollIntoViewIfNeeded();

    const loadMoreButton = signedInPage.getByRole('button', { name: 'もっと見る' });
    
    if (await loadMoreButton.isVisible()) {
      await loadMoreButton.click();
      
      await expect(signedInPage.getByText('活動データの読み込みに失敗しました')).toBeVisible({ timeout: 10000 });
    }
  });

  test('活動タイムラインのアクセシビリティ', async ({
    signedInPage,
  }) => {
    await assertAuthState(signedInPage, true);

    await signedInPage.locator('section').filter({ hasText: '活動タイムライン' }).scrollIntoViewIfNeeded();

    const heading = signedInPage.getByRole('heading', { name: /活動タイムライン/ });
    await expect(heading).toBeVisible();
    
    const loadMoreButton = signedInPage.getByRole('button', { name: 'もっと見る' });
    
    if (await loadMoreButton.isVisible()) {
      await signedInPage.keyboard.press('Tab');
      await expect(loadMoreButton).toBeFocused();
      
      await signedInPage.keyboard.press('Enter');
      
      await expect(signedInPage.getByText('読み込み中...')).toBeVisible({ timeout: 5000 });
    }
  });

  test('活動タイムラインの空の状態表示', async ({
    page,
  }) => {
    await page.goto('/');
    
    await page.locator('section').filter({ hasText: '活動タイムライン' }).scrollIntoViewIfNeeded();
    
    await expect(page.getByText('活動履歴がありません')).toBeVisible({ timeout: 10000 });
  });
});
