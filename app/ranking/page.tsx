import { RankingTop } from "@/components/ranking";
import { CurrentUserCard } from "@/components/ranking/current-user-card";
import { RankingTabs } from "@/components/ranking/ranking-tabs";
import { createClient } from "@/lib/supabase/server";

export default async function RankingPage() {
  const supabase = await createClient();

  // ユーザー情報取得
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  let userRanking = null;

  if (user) {
    const { data } = await supabase
      .from("user_ranking_view")
      .select("*")
      .eq("user_id", user.id)
      .single();
    userRanking = data;
  }

  return (
    <div className="flex flex-col min-h-screen py-4 w-full">
      <RankingTabs>
        {/* ユーザーのランキングカード */}
        {userRanking && (
          <section className="py-4 bg-white">
            <CurrentUserCard currentUser={userRanking} />
          </section>
        )}

        <section className="py-4 bg-white">
          {/* ランキング */}
          <RankingTop limit={100} />
        </section>
      </RankingTabs>
    </div>
  );
}
