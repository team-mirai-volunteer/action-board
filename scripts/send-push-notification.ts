#!/usr/bin/env tsx

// 実行例:
// npx tsx scripts/send-push-notification.ts --title "お知らせ" --body "内容" --url "https://example.com"
// npx tsx scripts/send-push-notification.ts --title "お知らせ" --body "内容" --url "https://example.com" --dry-run

import path from "node:path";
import { Command } from "commander";
import dotenv from "dotenv";
import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/adminClient";

// .envファイルをロード（ローカル開発用）
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const program = new Command();

program
  .name("send-push-notification")
  .description("全ユーザーにWeb Push通知を送信するCLI")
  .requiredOption("-t, --title <title>", "通知タイトル")
  .requiredOption("-b, --body <body>", "通知本文")
  .requiredOption("-u, --url <url>", "通知クリック時に開くURL")
  .option("--icon <icon>", "通知アイコンURL", "/img/icon-192.png")
  .option("--dry-run", "実際には送信せず対象件数だけ表示する", false)
  .parse(process.argv);

const options = program.opts<{
  title: string;
  body: string;
  url: string;
  icon: string;
  dryRun: boolean;
}>();

async function main() {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT;

  if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
    console.error(
      "❌ VAPID設定が不足しています。以下の環境変数を設定してください:\n" +
        "  NEXT_PUBLIC_VAPID_PUBLIC_KEY\n" +
        "  VAPID_PRIVATE_KEY\n" +
        "  VAPID_SUBJECT",
    );
    process.exit(1);
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  const supabase = await createAdminClient();

  // 全サブスクリプションを取得
  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth");

  if (error) {
    console.error("❌ サブスクリプション取得エラー:", error.message);
    process.exit(1);
  }

  if (!subscriptions || subscriptions.length === 0) {
    console.log("ℹ️  送信対象のサブスクリプションがありません。");
    process.exit(0);
  }

  console.log(`📣 送信対象: ${subscriptions.length} 件`);

  if (options.dryRun) {
    console.log("✅ [dry-run] 送信はスキップしました。");
    process.exit(0);
  }

  // application/notification+json 形式のペイロード（Declarative Web Push 仕様）
  const payload = JSON.stringify({
    title: options.title,
    options: {
      body: options.body,
      icon: options.icon,
    },
    default_action_url: options.url,
  });

  let successCount = 0;
  let failureCount = 0;
  const expiredIds: string[] = [];

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        payload,
        {
          contentEncoding: "aes128gcm",
          headers: {
            "Content-Type": "application/notification+json",
          },
        },
      );
      successCount++;
    } catch (error) {
      const statusCode =
        error instanceof webpush.WebPushError ? error.statusCode : null;

      // 410 Gone / 404 Not Found: サブスクリプション期限切れ → 削除対象として記録
      if (statusCode === 410 || statusCode === 404) {
        expiredIds.push(sub.id);
        console.warn(`⚠️  期限切れ (${statusCode}): ${sub.endpoint}`);
      } else {
        failureCount++;
        console.error(
          `❌ 送信失敗: ${sub.endpoint} - ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  // 期限切れのサブスクリプションを一括削除
  if (expiredIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("push_subscriptions")
      .delete()
      .in("id", expiredIds);

    if (deleteError) {
      console.error("⚠️  期限切れサブスクリプション削除エラー:", deleteError.message);
    } else {
      console.log(`🗑️  期限切れサブスクリプション削除: ${expiredIds.length} 件`);
    }
  }

  console.log(
    `\n✅ 完了: 成功 ${successCount} / 期限切れ ${expiredIds.length} / 失敗 ${failureCount}`,
  );

  if (failureCount > 0) {
    process.exit(1);
  }
  process.exit(0);
}

main();
