import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/avatar";
import { createClient } from "@/lib/supabase/server";
import type { HTMLProps } from "react";

interface MyAvatarProps {
  className?: HTMLProps<HTMLElement>["className"];
}

export default async function MyAvatar({ className }: MyAvatarProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Avatar data-testid="avatar" className={className}>
        <AvatarFallback className="bg-emerald-100 text-emerald-700 font-medium">
          ユ
        </AvatarFallback>
      </Avatar>
    );
  }

  const { data: profile } = await supabase
    .from("private_users")
    .select("*")
    .eq("id", user.id)
    .single();

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
