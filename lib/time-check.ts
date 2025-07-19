export function isAfterSwitchTime(): boolean {
  const now = new Date();
  const switchTime = new Date("2025-07-19T23:59:00+09:00");
  return now >= switchTime;
}
