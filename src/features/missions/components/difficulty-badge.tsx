import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/utils";

interface DifficultyBadgeProps {
  difficulty: number;
  showLabel?: boolean;
  className?: string;
}

export function DifficultyBadge({
  difficulty,
  showLabel = true,
  className,
}: DifficultyBadgeProps) {
  const getDifficultyStyles = (difficulty: number) => {
    return "text-gray-700 border-gray-400 hover:bg-gray-50";
  };

  const difficultyLabels = {
    1: "⭐",
    2: "⭐⭐",
    3: "⭐⭐⭐",
    4: "⭐⭐⭐⭐",
    5: "⭐⭐⭐⭐⭐",
  };

  const label =
    difficultyLabels[difficulty as keyof typeof difficultyLabels] || difficulty;

  return (
    <Badge
      variant="outline"
      className={cn(getDifficultyStyles(difficulty), "border", className)}
    >
      {showLabel ? `難易度: ${label}` : label}
    </Badge>
  );
}
