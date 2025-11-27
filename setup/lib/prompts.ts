// 対話的プロンプト

import { confirm, input } from "@inquirer/prompts";
import type { TeamConfig } from "./config.js";
import {
  validateEmail,
  validateHexColor,
  validateTeamId,
  validateUrl,
} from "./validator.js";

/**
 * チーム設定の対話的入力
 */
export async function promptTeamConfig(): Promise<TeamConfig> {
  console.log("\n=== チーム設定セットアップ ===\n");

  const teamId = await input({
    message: "チームID（英数字・ハイフンのみ）:",
    validate: (value) => {
      if (!value) return "必須項目です";
      if (!validateTeamId(value)) return "英数字とハイフンのみ使用できます";
      return true;
    },
  });

  const teamName = await input({
    message: "チーム名:",
    validate: (value) => (value ? true : "必須項目です"),
  });

  const description = await input({
    message: "チームの説明（オプション）:",
  });

  const primaryColor = await input({
    message: "プライマリカラー（HEX形式、例: #FF0000）:",
    default: "#FF0000",
    validate: (value) => {
      if (!validateHexColor(value))
        return "HEX形式で入力してください（例: #FF0000）";
      return true;
    },
  });

  const autoGenerateColors = await confirm({
    message: "カラーパレットを自動生成しますか？",
    default: true,
  });

  const siteUrl = await input({
    message: "サイトURL（オプション）:",
    validate: (value) => {
      if (!value) return true;
      if (!validateUrl(value)) return "有効なURLを入力してください";
      return true;
    },
  });

  const email = await input({
    message: "サポートメール（オプション）:",
    validate: (value) => {
      if (!value) return true;
      if (!validateEmail(value))
        return "有効なメールアドレスを入力してください";
      return true;
    },
  });

  const config: TeamConfig = {
    team: {
      id: teamId,
      name: teamName,
      ...(description && { description }),
    },
    colors: {
      primary: primaryColor,
    },
    features: {
      missions: true,
      ranking: true,
      achievements: true,
    },
    ...(siteUrl || email
      ? {
          site: {
            ...(siteUrl && { url: siteUrl }),
            ...(email && { email }),
          },
        }
      : {}),
  };

  return config;
}
