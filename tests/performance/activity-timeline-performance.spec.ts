import { test, expect } from '@playwright/test';

test.describe('活動タイムライン パフォーマンステスト', () => {
  test('初期ページロード性能', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    await page.locator('section').filter({ hasText: '活動タイムライン' }).waitFor();
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
    
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals: Record<string, number> = {};
          
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              vitals.fcp = entry.startTime;
            }
            if (entry.name === 'largest-contentful-paint') {
              vitals.lcp = entry.startTime;
            }
          });
          
          resolve(vitals);
        }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
        
        setTimeout(() => resolve({}), 5000);
      });
    });
    
    console.log('Performance metrics:', metrics);
  });

  test('ページネーション性能', async ({ page }) => {
    await page.goto('/');
    
    await page.locator('section').filter({ hasText: '活動タイムライン' }).scrollIntoViewIfNeeded();
    
    const loadMoreButton = page.getByRole('button', { name: 'もっと見る' });
    
    if (await loadMoreButton.isVisible()) {
      const startTime = Date.now();
      
      await loadMoreButton.click();
      
      await page.getByText('読み込み中...').waitFor({ state: 'visible' });
      await page.getByText('読み込み中...').waitFor({ state: 'hidden' });
      
      const paginationTime = Date.now() - startTime;
      
      expect(paginationTime).toBeLessThan(2000);
    }
  });

  test('メモリ使用量テスト', async ({ page }) => {
    await page.goto('/');
    
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    await page.locator('section').filter({ hasText: '活動タイムライン' }).scrollIntoViewIfNeeded();
    
    for (let i = 0; i < 3; i++) {
      const loadMoreButton = page.getByRole('button', { name: 'もっと見る' });
      
      if (await loadMoreButton.isVisible()) {
        await loadMoreButton.click();
        await page.getByText('読み込み中...').waitFor({ state: 'visible' });
        await page.getByText('読み込み中...').waitFor({ state: 'hidden' });
        await page.waitForTimeout(1000);
      } else {
        break;
      }
    }
    
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    const memoryIncrease = finalMemory - initialMemory;
    
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    
    console.log(`Memory usage: Initial: ${initialMemory}, Final: ${finalMemory}, Increase: ${memoryIncrease}`);
  });

  test('大量データ処理性能', async ({ page }) => {
    await page.goto('/');
    
    await page.locator('section').filter({ hasText: '活動タイムライン' }).scrollIntoViewIfNeeded();
    
    let totalLoadTime = 0;
    let loadCount = 0;
    
    for (let i = 0; i < 10; i++) {
      const loadMoreButton = page.getByRole('button', { name: 'もっと見る' });
      
      if (await loadMoreButton.isVisible()) {
        const startTime = Date.now();
        
        await loadMoreButton.click();
        await page.getByText('読み込み中...').waitFor({ state: 'visible' });
        await page.getByText('読み込み中...').waitFor({ state: 'hidden' });
        
        const loadTime = Date.now() - startTime;
        totalLoadTime += loadTime;
        loadCount++;
        
        expect(loadTime).toBeLessThan(3000);
        
        await page.waitForTimeout(500);
      } else {
        break;
      }
    }
    
    if (loadCount > 0) {
      const averageLoadTime = totalLoadTime / loadCount;
      console.log(`Average pagination load time: ${averageLoadTime}ms over ${loadCount} loads`);
      
      expect(averageLoadTime).toBeLessThan(2000);
    }
  });

  test('レスポンシブ性能テスト', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1200, height: 800, name: 'Desktop' },
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      const startTime = Date.now();
      await page.goto('/');
      
      await page.locator('section').filter({ hasText: '活動タイムライン' }).waitFor();
      const loadTime = Date.now() - startTime;
      
      console.log(`${viewport.name} load time: ${loadTime}ms`);
      
      expect(loadTime).toBeLessThan(3000);
    }
  });
});
