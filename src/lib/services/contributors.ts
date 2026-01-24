"use server";

import { createClient } from "@/lib/supabase/client";

export interface ContributorData {
  name: string;
}

/**
 * ユーザーランキングビューから全貢献者名を取得
 * 投開票日のエンドクレジット表示用
 *
 * @returns 貢献者名の配列（ランク順）
 */
export async function getContributorNames(): Promise<ContributorData[]> {
  const supabase = createClient();
  const pageSize = 1000;
  let from = 0;
  const all: ContributorData[] = [];

  while (true) {
    const { data, error } = await supabase
      .from("user_ranking_view")
      .select("name")
      .order("rank", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) {
      console.error("Error fetching contributors:", error);
      throw new Error("貢献者一覧の取得に失敗しました");
    }

    if (!data || data.length === 0) break;

    for (const user of data) {
      all.push({ name: user.name || "Unknown" });
    }

    if (data.length < pageSize) break;
    from += pageSize;
  }

  return all;
}
