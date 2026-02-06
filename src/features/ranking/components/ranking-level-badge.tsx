import { Badge } from "@/components/ui/badge";
import { getLevelBadgeStyle } from "../utils/level-badge-styles";

interface LevelBadgeProps {
  level: number;
  className?: string;
  showPrefix?: boolean;
}

export function LevelBadge({
  level,
  className = "",
  showPrefix = true,
}: LevelBadgeProps) {
  const baseClasses = "px-3 py-1 rounded-full font-medium";
  const levelClasses = getLevelBadgeStyle(level);
  const combinedClassName =
    `${levelClasses} ${baseClasses} ${className}`.trim();

  return (
    <Badge className={combinedClassName}>
      {showPrefix ? `Lv.${level}` : level}
    </Badge>
  );
}
