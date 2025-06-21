// TOPページ用のランキングコンポーネント
import { Card } from "@/components/ui/card";
import { getRanking } from "@/lib/services/ranking";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { RankingItem } from "./ranking-item";

interface RankingTopProps {
  limit?: number;
  showDetailedInfo?: boolean; // 詳細情報を表示するかどうか
}

export default async function RankingTop({
  limit = 10,
  showDetailedInfo = false,
}: RankingTopProps) {
  const rankings = await getRanking(limit);

  return (
    <div className="px-4">
      <div className="flex flex-col gap-6">
        <div className="">
          <h2 className="text-2xl md:text-4xl text-gray-900 mb-2 text-center">
            🏅アクションリーダートップ{limit}
          </h2>
        </div>

        <Card className="border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 bg-white">
          <div className="space-y-1">
            {rankings.map((user) => (
              <RankingItem key={user.user_id} user={user} />
            ))}
          </div>
        </Card>
        {showDetailedInfo && (
          <Link
            href="/ranking"
            className="flex items-center text-teal-600 hover:text-teal-700 self-center"
          >
            トップ100を見る
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        )}
      </div>
    </div>
  );
}
