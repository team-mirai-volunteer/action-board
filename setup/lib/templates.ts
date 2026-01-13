// テンプレート

import type { TeamConfig } from "./config.js";

/**
 * .env.localファイルのテンプレート生成
 */
export function generateEnvTemplate(config: TeamConfig): string {
  const lines = [
    "# Team Configuration",
    `NEXT_PUBLIC_TEAM_ID="${config.team.id}"`,
    `NEXT_PUBLIC_TEAM_NAME="${config.team.name}"`,
    "",
    "# Colors",
    `NEXT_PUBLIC_PRIMARY_COLOR="${config.colors.primary}"`,
  ];

  if (config.colors.secondary) {
    lines.push(`NEXT_PUBLIC_SECONDARY_COLOR="${config.colors.secondary}"`);
  }
  if (config.colors.accent) {
    lines.push(`NEXT_PUBLIC_ACCENT_COLOR="${config.colors.accent}"`);
  }
  if (config.colors.accentLight) {
    lines.push(`NEXT_PUBLIC_ACCENT_LIGHT_COLOR="${config.colors.accentLight}"`);
  }

  if (config.site?.url) {
    lines.push("", "# Site", `NEXT_PUBLIC_SITE_URL="${config.site.url}"`);
  }

  if (config.site?.email) {
    lines.push(`NEXT_PUBLIC_SUPPORT_EMAIL="${config.site.email}"`);
  }

  return `${lines.join("\n")}\n`;
}

/**
 * チーム設定JSONCファイルのテンプレート生成
 */
export function generateTeamConfigTemplate(config: TeamConfig): string {
  return JSON.stringify(config, null, 2);
}
