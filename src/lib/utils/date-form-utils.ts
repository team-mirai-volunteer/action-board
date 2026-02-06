export function formatBirthDate(
  year: number | null,
  month: number | null,
  day: number | null,
): string {
  if (!year || !month || !day) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function generateDaysArray(year: number, month: number): number[] {
  return Array.from({ length: getDaysInMonth(year, month) }, (_, i) => i + 1);
}
