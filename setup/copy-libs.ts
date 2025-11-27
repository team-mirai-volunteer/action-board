#!/usr/bin/env node
// ライブラリコピースクリプト

import { existsSync } from "node:fs";
import { copyFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import chalk from "chalk";

async function main() {
  try {
    console.log(chalk.blue("\n📦 ライブラリファイルをコピー中...\n"));

    const libDir = join(process.cwd(), "lib");
    const targetDir = join(process.cwd(), "..", "lib", "setup");

    // ターゲットディレクトリ作成
    if (!existsSync(targetDir)) {
      await mkdir(targetDir, { recursive: true });
    }

    // ライブラリファイル一覧
    const files = [
      "config.ts",
      "color-utils.ts",
      "generator.ts",
      "prompts.ts",
      "replacer.ts",
      "templates.ts",
      "transaction.ts",
      "validator.ts",
    ];

    // コピー
    for (const file of files) {
      const src = join(libDir, file);
      const dest = join(targetDir, file);
      await copyFile(src, dest);
      console.log(chalk.green(`✓ ${file}`));
    }

    console.log(chalk.bold.green("\n✅ コピー完了！\n"));
  } catch (error) {
    console.error(chalk.red("\n❌ コピーに失敗しました:\n"));
    console.error(error);
    process.exit(1);
  }
}

main();
