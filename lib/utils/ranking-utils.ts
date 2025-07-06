export const formatUserDisplayName = (name: string | null): string => {
  return name || "名前未設定";
};

export const formatUserPrefecture = (prefecture: string | null): string => {
  return prefecture || "未設定";
};

export const maskUsername = (name: string | null): string => {
  if (!name || name.length === 0) return "不明なユーザー";
  if (name.length === 1) return name;
  return name[0] + "x".repeat(name.length - 1);
};
