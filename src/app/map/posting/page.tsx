import PostingPageClient from "@/features/map-posting/components/posting-page";
import { createClient } from "@/lib/supabase/client";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "チームみらい機関誌配布マップ",
  description: "チームみらい機関誌配布マップ",
};

export default async function PostingPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return <PostingPageClient userId={user.id} />;
}
