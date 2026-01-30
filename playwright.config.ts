import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";

if (!process.env.CI) {
  dotenv.config({ path: ".env" });
  dotenv.config({ path: ".env.local", override: true });
  dotenv.config({ path: ".env.test", override: true });
}

const PORT = process.env.PORT || 3000;
const baseURL = `http://localhost:${PORT}`;

/**
 * Playwrightの設定
 * https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests/e2e",
  /* 各テスト実行の最大タイムアウト時間 */
  workers: 2,
  timeout: 30 * 1000,
  expect: {
    /* テストアサーションのタイムアウト時間 */
    timeout: 5000,
  },
  /* CI環境での失敗時のリトライ回数 */
  retries: 2,
  /* テスト結果のレポーター設定 */
  reporter: "html",
  /* 共有の設定 */
  use: {
    baseURL,
    /* テスト実行中のトレースを取得 */
    trace: "retry-with-trace",
    /* ナビゲーションのタイムアウト */
    navigationTimeout: 10000,
    /* スクリーンショットの設定 */
    screenshot: "only-on-failure",
  },

  /* プロジェクト固有の設定 */
  projects: [
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],

  /* Webサーバーの設定 */
  webServer: {
    command: process.env.CI ? "pnpm run start" : "pnpm run dev",
    url: baseURL,
    timeout: 180 * 1000,
    reuseExistingServer: !process.env.CI,
  },
});
