/**
 * Returns CSS classes for difficulty badge styling.
 */
export function getDifficultyStyles(_difficulty: number): string {
  return "text-gray-700 border-gray-400 hover:bg-gray-50";
}

/**
 * Difficulty labels mapping difficulty number to star representations.
 */
export const difficultyLabels: Record<number, string> = {
  1: "⭐",
  2: "⭐⭐",
  3: "⭐⭐⭐",
  4: "⭐⭐⭐⭐",
  5: "⭐⭐⭐⭐⭐",
};

/**
 * Returns the display label for a given difficulty level.
 * Falls back to the number itself if no mapping exists.
 */
export function getDifficultyLabel(difficulty: number): string | number {
  return difficultyLabels[difficulty] || difficulty;
}
