// 設定型定義・変換

export interface TeamConfig {
  team: {
    id: string;
    name: string;
    description?: string;
  };
  colors: {
    primary: string;
    secondary?: string;
    accent?: string;
    accentLight?: string;
  };
  features?: {
    missions?: boolean;
    ranking?: boolean;
    achievements?: boolean;
  };
  site?: {
    url?: string;
    email?: string;
  };
}

export interface EnvConfig {
  NEXT_PUBLIC_TEAM_ID: string;
  NEXT_PUBLIC_TEAM_NAME: string;
  NEXT_PUBLIC_PRIMARY_COLOR: string;
  NEXT_PUBLIC_SECONDARY_COLOR?: string;
  NEXT_PUBLIC_ACCENT_COLOR?: string;
  NEXT_PUBLIC_ACCENT_LIGHT_COLOR?: string;
}

export function teamConfigToEnv(config: TeamConfig): EnvConfig {
  return {
    NEXT_PUBLIC_TEAM_ID: config.team.id,
    NEXT_PUBLIC_TEAM_NAME: config.team.name,
    NEXT_PUBLIC_PRIMARY_COLOR: config.colors.primary,
    NEXT_PUBLIC_SECONDARY_COLOR: config.colors.secondary,
    NEXT_PUBLIC_ACCENT_COLOR: config.colors.accent,
    NEXT_PUBLIC_ACCENT_LIGHT_COLOR: config.colors.accentLight,
  };
}

export function parseJsonc(content: string): unknown {
  // Remove comments from JSONC
  // Split by lines to handle line comments properly
  const lines = content.split("\n");
  const withoutComments = lines
    .map((line) => {
      // Remove single-line comments
      const commentIndex = line.indexOf("//");
      if (commentIndex !== -1) {
        // Check if // is inside a string
        const beforeComment = line.substring(0, commentIndex);
        const quoteCount = (beforeComment.match(/"/g) || []).length;
        // If odd number of quotes, // is inside a string
        if (quoteCount % 2 === 0) {
          return line.substring(0, commentIndex);
        }
      }
      return line;
    })
    .join("\n")
    .replace(/\/\*[\s\S]*?\*\//g, ""); // Remove /* */ comments

  return JSON.parse(withoutComments);
}
