export const formatUserDisplayName = (name: string | null): string => {
  return name || "名前未設定";
};

export const formatUserPrefecture = (prefecture: string | null): string => {
  return prefecture || "未設定";
};
