import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import BoardPageClient from "./BoardPageClient";

export const metadata: Metadata = {
  title: "チームみらいポスター掲示板マップ",
  description: "チームみらいポスター掲示板マップ",
};

export default async function BoardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return <BoardPageClient userId={user.id} />;
}
