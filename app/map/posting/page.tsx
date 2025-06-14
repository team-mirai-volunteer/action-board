import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PostingPageClient from "./PostingPageClient";

export const metadata: Metadata = {
  title: "チームみらい機関誌配布マップ",
  description: "チームみらい機関誌配布マップ",
};

export default async function PostingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return <PostingPageClient userId={user.id} />;
}
