import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "ポスター掲示板マップ",
  description: "チームみらいのポスター掲示板の配置状況を確認できます",
};

export default async function PosterMapPage() {
  // Redirect to elections list page
  redirect("/map/poster/elections");
}
