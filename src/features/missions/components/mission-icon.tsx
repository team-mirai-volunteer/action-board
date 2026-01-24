import { cn } from "@/lib/utils/utils";

interface MissionIconProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-10 h-10",
  md: "w-12 h-12",
  lg: "w-24 h-24",
};

export function MissionIcon({
  src,
  alt,
  size = "md",
  className,
}: MissionIconProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn("object-cover", sizeClasses[size], className)}
    />
  );
}
