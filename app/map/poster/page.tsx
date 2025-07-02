import type { Metadata } from "next";
import PosterMapPageClientOptimized from "./PosterMapPageClientOptimized";

export const metadata: Metadata = {
  title: "ポスター掲示板マップ",
  description: "チームみらいのポスター掲示板の配置状況を確認できます",
};

export default async function PosterMapPage() {
  return <PosterMapPageClientOptimized />;
}
