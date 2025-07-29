export function isAfterSwitchTime(): boolean {
  const now = new Date();
  const switchTime = new Date("2029-07-20T00:00:00+09:00");
  return now >= switchTime;
}
