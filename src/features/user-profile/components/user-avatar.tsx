import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/avatar";
import { createClient } from "@/lib/supabase/client";
import clsx from "clsx";
import type { HTMLProps } from "react";

interface UserProfile {
  name?: string | null;
  avatar_url?: string | null;
}

interface UserAvatarProps {
  userProfile: UserProfile;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: HTMLProps<HTMLElement>["className"];
}

export default function UserAvatar({
  className,
  userProfile,
  size = "md",
}: UserAvatarProps) {
  const supabase = createClient();
  let avatarUrl = userProfile.avatar_url;
  if (avatarUrl) {
    avatarUrl = getAvatarUrl(supabase, avatarUrl);
  }
  const sizeClass = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
    "2xl": "w-32 h-32",
  };
  const textSizeClass = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
    xl: "text-4xl",
    "2xl": "text-6xl",
  };
  return (
    <Avatar className={clsx(sizeClass[size], className)}>
      <AvatarImage
        src={avatarUrl || undefined}
        alt="プロフィール画像"
        style={{ objectFit: "cover" }}
      />
      <AvatarFallback
        className={clsx(
          "bg-emerald-100 text-emerald-700 font-medium",
          textSizeClass[size],
        )}
      >
        {userProfile.name?.substring(0, 1) ?? "ユ"}
      </AvatarFallback>
    </Avatar>
  );
}
