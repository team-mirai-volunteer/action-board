#!/usr/bin/env tsx

// 実行例:
// npx tsx scripts/update-user-email.ts --old 旧メールアドレス --new 新メールアドレス

import path from "node:path";
import { Command } from "commander";
import dotenv from "dotenv";
import { createAdminClient } from "@/lib/supabase/adminClient";

// .envファイルをロード（ローカル開発用）
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const program = new Command();

program
  .name("update-user-email")
  .description(
    "Supabase RPC + Admin APIでユーザーのメールアドレスを変更するCLI",
  )
  .requiredOption("-o, --old <oldEmail>", "変更前（旧）のメールアドレス")
  .requiredOption("-n, --new <newEmail>", "変更後（新）のメールアドレス")
  .option("-c, --confirm", "新メールを確認済みにする", false)
  .parse(process.argv);

const {
  old: oldEmail,
  new: newEmail,
  confirm,
} = program.opts<{
  old: string;
  new: string;
  confirm: boolean;
}>();

(async () => {
  const supabase = await createAdminClient();

  // --- RPCを使って旧メールのユーザーを検索 ---
  console.log(`🔍 ユーザー検索中: ${oldEmail}`);
  const { data: oldUser, error: getError } = await supabase.rpc(
    "get_user_by_email",
    { user_email: oldEmail },
  );

  if (getError) {
    console.error(`❌ RPC実行エラー: ${getError.message}`);
    process.exit(1);
  }
  if (!oldUser || oldUser.length === 0) {
    console.error(`❌ ユーザーが見つかりません: ${oldEmail}`);
    process.exit(1);
  }

  const userId = oldUser[0].id;
  console.log(`✅ ユーザー発見: id=${userId}`);

  // --- 新メールの重複チェック ---
  const { data: conflict, error: conflictErr } = await supabase.rpc(
    "get_user_by_email",
    { user_email: newEmail },
  );
  if (conflictErr) {
    console.error(`⚠️ 新メール確認時エラー: ${conflictErr.message}`);
  } else if (conflict && conflict.length > 0) {
    console.error(`❌ 新メールは既に使用されています: ${newEmail}`);
    process.exit(1);
  }

  // --- Admin APIで更新 ---
  const payload: { email: string; email_confirm?: boolean } = {
    email: newEmail,
  };
  if (confirm) payload.email_confirm = true;

  console.log(`📤 ${oldEmail} → ${newEmail} に変更中...`);
  const { data: updated, error: updateErr } =
    await supabase.auth.admin.updateUserById(userId, payload);

  if (updateErr) {
    console.error(`❌ 更新失敗: ${updateErr.message}`);
    process.exit(1);
  }

  console.log("🎉 更新完了");
  console.log(
    JSON.stringify(
      {
        id: updated.user.id,
        oldEmail,
        newEmail,
        emailConfirmedAt: updated.user.email_confirmed_at ?? null,
      },
      null,
      2,
    ),
  );
})();
