#!/usr/bin/env tsx

import { createWriteStream } from "node:fs";
import { join } from "node:path";
import { createServiceClient } from "@/lib/supabase/server";

interface UserData {
  id: string;
  email: string;
  address_prefecture: string;
}

async function getAllUsers(): Promise<UserData[]> {
  const supabase = await createServiceClient();
  const allUsers: UserData[] = [];
  let hasMore = true;
  let offset = 0;
  const limit = 1000;

  console.log("Supabaseから全ユーザーデータを取得中...");

  // まず全ての認証ユーザーを取得
  console.log("認証ユーザーを全件取得中...");
  const allAuthUsers = new Map<string, string>(); // id -> email のマップ
  let authHasMore = true;
  let currentAuthPage = 1;

  while (authHasMore) {
    const { data: authData, error: authError } =
      await supabase.auth.admin.listUsers({
        page: currentAuthPage,
        perPage: 1000,
      });

    if (authError) {
      console.error("認証テーブルからのデータ取得エラー:", authError);
      throw authError;
    }

    if (authData?.users) {
      for (const user of authData.users) {
        if (user.email) {
          allAuthUsers.set(user.id, user.email);
        }
      }
      console.log(`認証ユーザー取得済み: ${allAuthUsers.size} 件`);

      // 次のページがあるかチェック
      authHasMore = authData.users.length === 1000;
      currentAuthPage++;
    } else {
      authHasMore = false;
    }
  }

  console.log(`認証ユーザー取得完了: ${allAuthUsers.size} 件`);

  // 次にprivate_usersを取得してマッピング
  while (hasMore) {
    const { data: privateUsers, error: privateError } = await supabase
      .from("private_users")
      .select("id, address_prefecture")
      .range(offset, offset + limit - 1);

    if (privateError) {
      console.error(
        "private_usersテーブルからのデータ取得エラー:",
        privateError,
      );
      throw privateError;
    }

    if (!privateUsers || privateUsers.length === 0) {
      hasMore = false;
      break;
    }

    // データを結合
    const usersWithEmail = privateUsers
      .map((privateUser) => {
        const email = allAuthUsers.get(privateUser.id);
        return {
          id: privateUser.id,
          email: email || "",
          address_prefecture: privateUser.address_prefecture,
        };
      })
      .filter((user) => user.email); // メールアドレスがあるユーザーのみ

    allUsers.push(...usersWithEmail);

    console.log(`取得済み: ${allUsers.length} 件`);

    // 次のページへ
    offset += limit;
    hasMore = privateUsers.length === limit;
  }

  console.log(`全ユーザーデータ取得完了: ${allUsers.length} 件`);
  return allUsers;
}

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function exportToCSV(users: UserData[]): string {
  const outputPath = join(process.cwd(), "users-prefecture-export.csv");
  const writeStream = createWriteStream(outputPath);

  console.log("CSV出力開始...");

  // CSVヘッダー
  const headers = ["user_id", "email", "address_prefecture"];
  writeStream.write(`${headers.join(",")}\n`);

  // データ出力
  for (const user of users) {
    const row = [
      escapeCSV(user.id),
      escapeCSV(user.email),
      escapeCSV(user.address_prefecture),
    ];
    writeStream.write(`${row.join(",")}\n`);
  }

  writeStream.end();
  console.log(`CSV出力完了: ${outputPath}`);
  return outputPath;
}

async function main() {
  try {
    console.log("=== HubSpot都道府県情報エクスポート開始 ===");

    // 環境変数の確認
    const requiredEnvVars = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
    ];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        console.error(`必要な環境変数が設定されていません: ${envVar}`);
        process.exit(1);
      }
    }

    // 全ユーザーデータを取得
    const users = await getAllUsers();

    // CSVに出力
    const outputPath = exportToCSV(users);

    console.log("=== エクスポート完了 ===");
    console.log(`出力ファイル: ${outputPath}`);
    console.log(`処理件数: ${users.length} 件`);

    // 都道府県別の統計表示
    const prefectureStats = users.reduce(
      (acc, user) => {
        acc[user.address_prefecture] = (acc[user.address_prefecture] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    console.log("\n=== 都道府県別統計 ===");
    for (const [prefecture, count] of Object.entries(prefectureStats).sort(
      ([, a], [, b]) => b - a,
    )) {
      console.log(`${prefecture}: ${count} 件`);
    }
  } catch (error) {
    console.error("エラーが発生しました:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
