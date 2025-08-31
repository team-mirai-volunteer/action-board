import type { Page } from "@playwright/test";
import { assertAuthState, expect, test } from "../e2e-test-helpers";

async function testPrefectureNavigation(page: Page, name: string, url: string) {
  await expect(
    page.locator("a").filter({ hasText: new RegExp(name) }),
  ).toBeVisible({ timeout: 10000 });
  await page.getByText(name).click();
  const pattern = new RegExp(`${url.replace(/\/$/, "")}\/?`);
  await expect(page).toHaveURL(pattern, { timeout: 10000 });
}

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

    // 各都道府県マップに遷移（簡潔化）
    const prefectureTests = [
      { name: "北海道", url: "/map/poster/hokkaido/" },
      { name: "宮城県", url: "/map/poster/miyagi/" },
      { name: "埼玉県", url: "/map/poster/saitama/" },
      { name: "千葉県", url: "/map/poster/chiba/" },
      { name: "東京都", url: "/map/poster/tokyo/" },
      { name: "神奈川県", url: "/map/poster/kanagawa/" },
      { name: "長野県", url: "/map/poster/nagano/" },
      { name: "愛知県", url: "/map/poster/aichi/" },
      { name: "大阪府", url: "/map/poster/osaka/" },
      { name: "兵庫県", url: "/map/poster/hyogo/" },
      { name: "愛媛県", url: "/map/poster/ehime/" },
      { name: "福岡県", url: "/map/poster/fukuoka/" },
    ];

    for (const { name, url } of prefectureTests) {
      await signedInPage.goto("/map/poster", { waitUntil: "domcontentloaded" });
      await testPrefectureNavigation(signedInPage, name, url);
    }

    // 一覧に戻って「ミッション一覧に戻る」を確認
    await signedInPage.goto("/map/poster", { waitUntil: "domcontentloaded" });

    // ミッション一覧に戻る
    await signedInPage
      .getByRole("link", { name: "ミッション一覧に戻る" })
      .click();
    await expect(signedInPage).toHaveURL(/\/#featured-missions/, {
      timeout: 10000,
    });
  });
});
