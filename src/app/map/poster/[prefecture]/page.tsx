import { getCurrentElection } from "@/features/elections/services/elections";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ prefecture: string }>;
}): Promise<Metadata> {
  const { prefecture } = await params;
  return {
    title: `${prefecture}のポスター掲示板マップ`,
    description: `${prefecture}のポスター掲示板の配置状況を確認できます`,
  };
}

export default async function PrefecturePosterMapPage({
  params,
}: {
  params: Promise<{ prefecture: string }>;
}) {
  const { prefecture } = await params;

  // Get current election and redirect to election-specific prefecture page
  const currentElection = await getCurrentElection();

  if (currentElection) {
    redirect(`/map/poster/elections/${currentElection.id}/${prefecture}`);
  }

  // If no election exists, redirect to elections list
  redirect("/map/poster/elections");
}
