import { Badge } from "@/components/ui/badge";

interface LevelBadgeProps {
  level: number;
  className?: string;
  showPrefix?: boolean;
}

function getLevelBadgeStyle(level: number) {
  if (level >= 40) return "bg-emerald-600 text-white";
  if (level >= 30) return "bg-emerald-500 text-white";
  if (level >= 20) return "bg-emerald-200 text-emerald-800";
  if (level >= 10) return "bg-emerald-100 text-emerald-700";
  return "bg-emerald-50 text-emerald-600";
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
