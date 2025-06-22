import { expect, test } from "../e2e-test-helpers";

test.describe("ポスターマップ機能", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test.describe("認証フロー", () => {
    test("ログイン状態で地図にアクセスできる", async ({ signedInPage }) => {
      await signedInPage.goto("/map/poster");
      await expect(signedInPage).toHaveURL("/map/poster");

      await expect(signedInPage.locator("h1")).toContainText(
        "選挙ポスター掲示場",
      );
    });

    test("未ログイン時は/sign-inページにリダイレクトされる", async ({
      page,
    }) => {
      await page.goto("/map/poster/東京都");

      await expect(page).toHaveURL(/.*\/sign-in/);
    });
  });

  test.describe("都道府県選択フロー", () => {
    test("メニューページから都道府県を選択できる", async ({ signedInPage }) => {
      await signedInPage.goto("/map/poster");

      await expect(signedInPage.locator("h1")).toContainText(
        "選挙ポスター掲示場",
      );

      const tokyoLink = signedInPage.locator('a[href="/map/poster/東京都"]');
      await expect(tokyoLink).toBeVisible();
      await tokyoLink.click();

      await expect(signedInPage).toHaveURL("/map/poster/東京都");
    });

    test("各都道府県ページに正しく遷移する", async ({ signedInPage }) => {
      const prefectures = ["東京都", "大阪府", "北海道"];

      for (const prefecture of prefectures) {
        await signedInPage.goto(
          `/map/poster/${encodeURIComponent(prefecture)}`,
        );
        await expect(signedInPage).toHaveURL(
          `/map/poster/${encodeURIComponent(prefecture)}`,
        );

        await signedInPage.waitForSelector(".leaflet-container", {
          timeout: 10000,
        });
        await expect(signedInPage.locator(".leaflet-container")).toBeVisible();
      }
    });

    test("無効な都道府県名でもエラーなく表示される", async ({
      signedInPage,
    }) => {
      await signedInPage.goto("/map/poster/存在しない県");

      await signedInPage.waitForSelector(".leaflet-container", {
        timeout: 10000,
      });
      await expect(signedInPage.locator(".leaflet-container")).toBeVisible();
    });
  });

  test.describe("地図表示", () => {
    test("地図が正しく表示される", async ({ signedInPage }) => {
      await signedInPage.goto("/map/poster/東京都");

      await signedInPage.waitForSelector(".leaflet-container", {
        timeout: 10000,
      });
      await expect(signedInPage.locator(".leaflet-container")).toBeVisible();

      await expect(signedInPage.locator(".leaflet-tile")).toBeVisible();
    });

    test("都道府県に応じて地図がセンタリングされる", async ({
      signedInPage,
    }) => {
      await signedInPage.goto("/map/poster/東京都");

      await signedInPage.waitForSelector(".leaflet-container", {
        timeout: 10000,
      });

      const mapContainer = signedInPage.locator(".leaflet-container");
      await expect(mapContainer).toBeVisible();

      await signedInPage.goto("/map/poster/北海道");
      await signedInPage.waitForSelector(".leaflet-container", {
        timeout: 10000,
      });
      await expect(mapContainer).toBeVisible();
    });

    test("ピンが地図上に表示される", async ({ signedInPage }) => {
      await signedInPage.goto("/map/poster/東京都");

      await signedInPage.waitForSelector(".leaflet-container", {
        timeout: 10000,
      });

      await signedInPage.waitForSelector(".custom-div-icon", {
        timeout: 15000,
      });
      const pins = signedInPage.locator(".custom-div-icon");
      await expect(pins.first()).toBeVisible();
    });

    test("レイヤーコントロールが表示される", async ({ signedInPage }) => {
      await signedInPage.goto("/map/poster/東京都");

      await signedInPage.waitForSelector(".leaflet-container", {
        timeout: 10000,
      });

      await signedInPage.waitForSelector(".leaflet-control-layers", {
        timeout: 10000,
      });
      const layerControl = signedInPage.locator(".leaflet-control-layers");
      await expect(layerControl).toBeVisible();
    });
  });

  test.describe("ピンインタラクション", () => {
    test.beforeEach(async ({ signedInPage }) => {
      await signedInPage.goto("/map/poster/東京都");
      await signedInPage.waitForSelector(".leaflet-container", {
        timeout: 10000,
      });
    });

    test("ピンをクリックすると情報パネルが表示される", async ({
      signedInPage,
    }) => {
      await signedInPage.waitForSelector(".custom-div-icon", {
        timeout: 15000,
      });

      const firstPin = signedInPage.locator(".custom-div-icon").first();
      await firstPin.click();

      await signedInPage.waitForSelector('[style*="position: fixed"]', {
        timeout: 5000,
      });
      const infoPanel = signedInPage.locator('[style*="position: fixed"]');
      await expect(infoPanel).toBeVisible();

      await expect(infoPanel.locator("h3")).toBeVisible();
      await expect(infoPanel.locator("strong:has-text('住所:')")).toBeVisible();
      await expect(
        infoPanel.locator("strong:has-text('掲示板番号:')"),
      ).toBeVisible();
    });

    test("ステータス更新ボタンが正しく表示される", async ({ signedInPage }) => {
      await signedInPage.waitForSelector(".custom-div-icon", {
        timeout: 15000,
      });

      const firstPin = signedInPage.locator(".custom-div-icon").first();
      await firstPin.click();

      await signedInPage.waitForSelector('[style*="position: fixed"]', {
        timeout: 5000,
      });

      const statusButtons = signedInPage.locator(
        'button:has-text("未"), button:has-text("完了"), button:has-text("異常")',
      );
      await expect(statusButtons.first()).toBeVisible();

      const updateButton = signedInPage.locator(
        'button:has-text("更新を送信")',
      );
      await expect(updateButton).toBeVisible();

      const cancelButton = signedInPage.locator(
        'button:has-text("キャンセル")',
      );
      await expect(cancelButton).toBeVisible();
    });

    test("ステータスを変更して更新できる", async ({ signedInPage }) => {
      await signedInPage.waitForSelector(".custom-div-icon", {
        timeout: 15000,
      });

      const firstPin = signedInPage.locator(".custom-div-icon").first();
      await firstPin.click();

      await signedInPage.waitForSelector('[style*="position: fixed"]', {
        timeout: 5000,
      });

      const completeButton = signedInPage.locator('button:has-text("完了")');
      await completeButton.click();

      const noteTextarea = signedInPage.locator(
        'textarea[placeholder="備考を入力してください"]',
      );
      await noteTextarea.fill("テスト更新");

      const updateButton = signedInPage.locator(
        'button:has-text("更新を送信")',
      );
      await updateButton.click();

      await signedInPage.waitForSelector('button:has-text("更新中...")', {
        timeout: 5000,
      });
      await signedInPage.waitForSelector('button:has-text("更新を送信")', {
        timeout: 10000,
      });
    });

    test("キャンセルボタンでパネルが閉じる", async ({ signedInPage }) => {
      await signedInPage.waitForSelector(".custom-div-icon", {
        timeout: 15000,
      });

      const firstPin = signedInPage.locator(".custom-div-icon").first();
      await firstPin.click();

      await signedInPage.waitForSelector('[style*="position: fixed"]', {
        timeout: 5000,
      });
      const infoPanel = signedInPage.locator('[style*="position: fixed"]');
      await expect(infoPanel).toBeVisible();

      const cancelButton = signedInPage.locator(
        'button:has-text("キャンセル")',
      );
      await cancelButton.click();

      await expect(infoPanel).not.toBeVisible();
    });

    test("備考欄に入力できる", async ({ signedInPage }) => {
      await signedInPage.waitForSelector(".custom-div-icon", {
        timeout: 15000,
      });

      const firstPin = signedInPage.locator(".custom-div-icon").first();
      await firstPin.click();

      await signedInPage.waitForSelector('[style*="position: fixed"]', {
        timeout: 5000,
      });

      const noteTextarea = signedInPage.locator(
        'textarea[placeholder="備考を入力してください"]',
      );
      await expect(noteTextarea).toBeVisible();

      await noteTextarea.fill("テスト備考");
      await expect(noteTextarea).toHaveValue("テスト備考");
    });
  });

  test.describe("エラーハンドリング", () => {
    test("ネットワークエラー時にエラーメッセージが表示される", async ({
      signedInPage,
    }) => {
      await signedInPage.route("**/api/poster-map/pins**", (route) => {
        route.abort("failed");
      });

      await signedInPage.goto("/map/poster/東京都");

      await signedInPage.waitForSelector("div:has-text('エラー:')", {
        timeout: 10000,
      });
      const errorMessage = signedInPage.locator("div:has-text('エラー:')");
      await expect(errorMessage).toBeVisible();
    });

    test("データが0件の場合でも地図が表示される", async ({ signedInPage }) => {
      await signedInPage.route("**/api/poster-map/pins**", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      });

      await signedInPage.goto("/map/poster/存在しない県");

      await signedInPage.waitForSelector(".leaflet-container", {
        timeout: 10000,
      });
      await expect(signedInPage.locator(".leaflet-container")).toBeVisible();
    });
  });

  test.describe("レスポンシブ対応", () => {
    test("モバイル画面でも地図が正しく表示される", async ({ signedInPage }) => {
      await signedInPage.setViewportSize({ width: 375, height: 667 });

      await signedInPage.goto("/map/poster/東京都");

      await signedInPage.waitForSelector(".leaflet-container", {
        timeout: 10000,
      });
      await expect(signedInPage.locator(".leaflet-container")).toBeVisible();

      const mapContainer = signedInPage.locator(".leaflet-container");
      const boundingBox = await mapContainer.boundingBox();
      expect(boundingBox?.width).toBeLessThanOrEqual(375);
    });

    test("タブレット画面でも情報パネルが適切に表示される", async ({
      signedInPage,
    }) => {
      await signedInPage.setViewportSize({ width: 768, height: 1024 });

      await signedInPage.goto("/map/poster/東京都");
      await signedInPage.waitForSelector(".leaflet-container", {
        timeout: 10000,
      });

      await signedInPage.waitForSelector(".custom-div-icon", {
        timeout: 15000,
      });
      const firstPin = signedInPage.locator(".custom-div-icon").first();
      await firstPin.click();

      await signedInPage.waitForSelector('[style*="position: fixed"]', {
        timeout: 5000,
      });
      const infoPanel = signedInPage.locator('[style*="position: fixed"]');
      await expect(infoPanel).toBeVisible();
    });
  });
});
