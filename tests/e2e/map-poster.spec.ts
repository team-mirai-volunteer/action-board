import { assertAuthState, expect, test } from "../e2e-test-helpers";

test.describe("ポスター掲示板マップのe2eテスト", () => {
  test("ポスター掲示板マップ遷移が正常に動作する", async ({ signedInPage }) => {
    await assertAuthState(signedInPage, true);

    // ポスター掲示板マップに遷移
    await signedInPage.getByTestId("usermenubutton").click();
    await signedInPage.getByText("ポスター掲示板マップ").click();
    await expect(signedInPage).toHaveURL(/\/map\/poster/, { timeout: 10000 });
    await expect(
      signedInPage.locator("h1").getByText("ポスター掲示板マップ"),
    ).toBeVisible();
    await expect(signedInPage.getByText("都道府県から選択")).toBeVisible();

    // 各都道府県マップに遷移
    await expect(
      signedInPage.locator("a").filter({ hasText: /北海道掲示板数/ }),
    ).toBeVisible({ timeout: 10000 });
    await signedInPage.getByText("北海道掲示板数").click();
    await expect(signedInPage).toHaveURL(/\/map\/poster\/hokkaido/, {
      timeout: 10000,
    });
    await signedInPage.goto("/map/poster");
    await expect(
      signedInPage.locator("a").filter({ hasText: /宮城県掲示板数/ }),
    ).toBeVisible({ timeout: 10000 });
    await signedInPage.getByText("宮城県掲示板数").click();
    await expect(signedInPage).toHaveURL(/\/map\/poster\/miyagi/, {
      timeout: 10000,
    });
    await signedInPage.goto("/map/poster");
    await expect(
      signedInPage.locator("a").filter({ hasText: /埼玉県掲示板数/ }),
    ).toBeVisible({ timeout: 10000 });
    await signedInPage.getByText("埼玉県掲示板数").click();
    await expect(signedInPage).toHaveURL(/\/map\/poster\/saitama/, {
      timeout: 10000,
    });
    await signedInPage.goto("/map/poster");
    await expect(
      signedInPage.locator("a").filter({ hasText: /千葉県掲示板数/ }),
    ).toBeVisible({ timeout: 10000 });
    await signedInPage.getByText("千葉県掲示板数").click();
    await expect(signedInPage).toHaveURL(/\/map\/poster\/chiba/, {
      timeout: 10000,
    });
    await signedInPage.goto("/map/poster");
    await expect(
      signedInPage.locator("a").filter({ hasText: /東京都掲示板数/ }),
    ).toBeVisible({ timeout: 10000 });
    await signedInPage.getByText("東京都掲示板数").click();
    await expect(signedInPage).toHaveURL(/\/map\/poster\/tokyo/, {
      timeout: 10000,
    });
    await signedInPage.goto("/map/poster");
    await expect(
      signedInPage.locator("a").filter({ hasText: /神奈川県掲示板数/ }),
    ).toBeVisible({ timeout: 10000 });
    await signedInPage.getByText("神奈川県掲示板数").click();
    await expect(signedInPage).toHaveURL(/\/map\/poster\/kanagawa/, {
      timeout: 10000,
    });
    await signedInPage.goto("/map/poster");
    await expect(
      signedInPage.locator("a").filter({ hasText: /長野県掲示板数/ }),
    ).toBeVisible({ timeout: 10000 });
    await signedInPage.getByText("長野県掲示板数").click();
    await expect(signedInPage).toHaveURL(/\/map\/poster\/nagano/, {
      timeout: 10000,
    });
    await signedInPage.goto("/map/poster");
    await expect(
      signedInPage.locator("a").filter({ hasText: /愛知県掲示板数/ }),
    ).toBeVisible({ timeout: 10000 });
    await signedInPage.getByText("愛知県掲示板数").click();
    await expect(signedInPage).toHaveURL(/\/map\/poster\/aichi/, {
      timeout: 10000,
    });
    await signedInPage.goto("/map/poster");
    await expect(
      signedInPage.locator("a").filter({ hasText: /大阪府掲示板数/ }),
    ).toBeVisible({ timeout: 10000 });
    await signedInPage.getByText("大阪府掲示板数").click();
    await expect(signedInPage).toHaveURL(/\/map\/poster\/osaka/, {
      timeout: 10000,
    });
    await signedInPage.goto("/map/poster");
    await expect(
      signedInPage.locator("a").filter({ hasText: /兵庫県掲示板数/ }),
    ).toBeVisible({ timeout: 10000 });
    await signedInPage.getByText("兵庫県掲示板数").click();
    await expect(signedInPage).toHaveURL(/\/map\/poster\/hyogo/, {
      timeout: 10000,
    });
    await signedInPage.goto("/map/poster");
    await expect(
      signedInPage.locator("a").filter({ hasText: /愛媛県掲示板数/ }),
    ).toBeVisible({ timeout: 10000 });
    await signedInPage.getByText("愛媛県掲示板数").click();
    await expect(signedInPage).toHaveURL(/\/map\/poster\/ehime/, {
      timeout: 10000,
    });
    await signedInPage.goto("/map/poster");
    await expect(
      signedInPage.locator("a").filter({ hasText: /福岡県掲示板数/ }),
    ).toBeVisible({ timeout: 10000 });
    await signedInPage.getByText("福岡県掲示板数").click();
    await expect(signedInPage).toHaveURL(/\/map\/poster\/fukuoka/, {
      timeout: 10000,
    });
    await signedInPage.goto("/map/poster");

    // ミッション一覧に戻る
    await signedInPage
      .getByRole("link", { name: "ミッション一覧に戻る" })
      .click();
    await expect(signedInPage).toHaveURL(/\/#featured-missions/, {
      timeout: 10000,
    });
  });
});
