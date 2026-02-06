/**
 * Returns CSS classes for level badge styling based on user level.
 * Used in ranking components to visually differentiate levels.
 */
export function getLevelBadgeStyle(level: number): string {
  if (level >= 40) return "bg-emerald-600 text-white";
  if (level >= 30) return "bg-emerald-500 text-white";
  if (level >= 20) return "bg-emerald-200 text-emerald-800";
  if (level >= 10) return "bg-emerald-100 text-emerald-700";
  return "bg-emerald-50 text-emerald-600";
}

/**
 * Returns CSS classes for level badge color in ranking items.
 * Accepts nullable level and defaults to 0.
 */
export function getLevelBadgeColor(level: number | null): string {
  const displayLevel = level ?? 0;

  if (displayLevel >= 40) return "bg-emerald-100 text-emerald-700";
  if (displayLevel >= 30) return "bg-emerald-100 text-emerald-700";
  if (displayLevel >= 20) return "bg-emerald-100 text-emerald-700";
  if (displayLevel >= 10) return "bg-emerald-100 text-emerald-700";
  return "text-emerald-700 bg-emerald-100";
}
