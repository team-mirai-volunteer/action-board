import PosterMap from "@/components/PosterMap";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import React from "react";

interface PosterMapPageProps {
  params: Promise<{
    prefecture: string;
  }>;
}

export default async function PosterMapPage({ params }: PosterMapPageProps) {
  const { prefecture } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const decodedPrefecture = decodeURIComponent(prefecture);

  return (
    <div className="h-screen w-full">
      <div className="absolute top-4 left-4 z-[1000] bg-white px-4 py-2 rounded-lg shadow-md">
        <h1 className="text-xl font-bold">
          {decodedPrefecture} - ポスターマップ
        </h1>
      </div>
      <PosterMap prefecture={decodedPrefecture} user={user} />
    </div>
  );
}
