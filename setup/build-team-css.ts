#!/usr/bin/env node
// CSS生成スクリプト

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import chalk from "chalk";
import { hexToHsl } from "./lib/color-utils.js";
import { parseJsonc } from "./lib/config.js";

async function main() {
  try {
    const configPath = process.argv[2];
    if (!configPath) {
      console.error(chalk.red("Usage: npm run build:css <config-file>"));
      process.exit(1);
    }

    console.log(chalk.blue(`\n📝 CSS生成: ${configPath}\n`));

    // 設定ファイル読み込み
    const configContent = await readFile(configPath, "utf-8");
    const config = parseJsonc(configContent);

    // カラーをHSLに変換
    const primary = hexToHsl(config.colors.primary);
    const secondary = config.colors.secondary
      ? hexToHsl(config.colors.secondary)
      : primary;
    const accent = config.colors.accent
      ? hexToHsl(config.colors.accent)
      : primary;
    const accentLight = config.colors.accentLight
      ? hexToHsl(config.colors.accentLight)
      : accent;

    // CSS生成
    const css = `
/* Team Colors - Generated from ${configPath} */
:root {
  --primary: ${primary.h} ${primary.s}% ${primary.l}%;
  --secondary: ${secondary.h} ${secondary.s}% ${secondary.l}%;
  --accent: ${accent.h} ${accent.s}% ${accent.l}%;
  --accent-light: ${accentLight.h} ${accentLight.s}% ${accentLight.l}%;
}
`.trim();

    // 出力先
    const outputPath = join(process.cwd(), "..", "app", "team-colors.css");
    await writeFile(outputPath, `${css}\n`, "utf-8");

    console.log(chalk.green(`✓ ${outputPath}`));
    console.log(chalk.bold.green("\n✅ CSS生成完了！\n"));
  } catch (error) {
    console.error(chalk.red("\n❌ CSS生成に失敗しました:\n"));
    console.error(error);
    process.exit(1);
  }
}

main();
