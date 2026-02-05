import Image from "next/image";
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

const sizeDimensions = {
  sm: 40,
  md: 48,
  lg: 96,
};

export function MissionIcon({
  src,
  alt,
  size = "md",
  className,
}: MissionIconProps) {
  const dimension = sizeDimensions[size];
  return (
    <Image
      src={src}
      alt={alt}
      width={dimension}
      height={dimension}
      className={cn("object-cover", sizeClasses[size], className)}
    />
  );
}
