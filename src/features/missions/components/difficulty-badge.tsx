import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/utils";
import {
  getDifficultyLabel,
  getDifficultyStyles,
} from "../utils/difficulty-styles";

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
  const label = getDifficultyLabel(difficulty);

  return (
    <Badge
      variant="outline"
      className={cn(getDifficultyStyles(difficulty), "border", className)}
    >
      {showLabel ? `難易度: ${label}` : label}
    </Badge>
  );
}
