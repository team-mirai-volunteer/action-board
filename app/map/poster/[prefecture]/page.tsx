import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PrefecturePosterMapClient from "./PrefecturePosterMapClient";

export async function generateMetadata({
  params,
}: {
  params: { prefecture: string };
}): Promise<Metadata> {
  const decodedPrefecture = decodeURIComponent(params.prefecture);
  return {
    title: `${decodedPrefecture}のポスター掲示板マップ`,
    description: `${decodedPrefecture}のポスター掲示板の配置状況を確認できます`,
  };
}

export default async function PrefecturePosterMapPage({
  params,
}: {
  params: { prefecture: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <PrefecturePosterMapClient
      userId={user.id}
      prefecture={params.prefecture}
    />
  );
}
