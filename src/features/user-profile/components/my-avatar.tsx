import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getMyProfile,
  getUser,
} from "@/features/user-profile/services/profile";
import { getAvatarUrl } from "@/lib/services/avatar";
import { createClient } from "@/lib/supabase/client";
import type { HTMLProps } from "react";

interface MyAvatarProps {
  className?: HTMLProps<HTMLElement>["className"];
}

export default async function MyAvatar({ className }: MyAvatarProps) {
  const supabase = createClient();

  const user = await getUser();

  if (!user) {
    return (
      <Avatar data-testid="avatar" className={className}>
        <AvatarFallback className="bg-emerald-100 text-emerald-700 font-medium">
          ユ
        </AvatarFallback>
      </Avatar>
    );
  }

  const profile = await getMyProfile().catch(() => null);

  const avatarUrl = profile?.avatar_url
    ? getAvatarUrl(supabase, profile.avatar_url)
    : null;

  return (
    <Avatar data-testid="avatar" className={className}>
      <AvatarImage
        src={avatarUrl || undefined}
        alt="プロフィール画像"
        style={{ objectFit: "cover" }}
      />
      <AvatarFallback className="bg-emerald-100 text-emerald-700 font-medium">
        {profile?.name.substring(0, 1) ?? "ユ"}
      </AvatarFallback>
    </Avatar>
  );
}
