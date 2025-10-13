// ファイル生成

import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { TeamConfig } from "./config.js";
import {
  generateEnvTemplate,
  generateTeamConfigTemplate,
} from "./templates.js";

/**
 * ディレクトリが存在しない場合は作成
 */
async function ensureDir(filePath: string) {
  const dir = dirname(filePath);
  await mkdir(dir, { recursive: true });
}

/**
 * .env.localファイルを生成
 */
export async function generateEnvFile(config: TeamConfig, outputPath: string) {
  const content = generateEnvTemplate(config);
  await ensureDir(outputPath);
  await writeFile(outputPath, content, "utf-8");
}

/**
 * チーム設定ファイルを生成
 */
export async function generateConfigFile(
  config: TeamConfig,
  outputPath: string,
) {
  const content = generateTeamConfigTemplate(config);
  await ensureDir(outputPath);
  await writeFile(outputPath, content, "utf-8");
}
