import type { Metadata } from "next";
import Link from "next/link";
import { getAllElections } from "@/features/elections/services/elections";

export const metadata: Metadata = {
  title: "選挙一覧 - ポスター掲示板マップ",
  description: "選挙ごとのポスター掲示板の配置状況を確認できます",
};

export default async function ElectionsListPage() {
  const elections = await getAllElections();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">選挙一覧</h1>

      <div className="space-y-4">
        {elections.length === 0 ? (
          <p className="text-gray-500">選挙データがありません</p>
        ) : (
          elections.map((election) => (
            <Link
              key={election.id}
              href={`/map/poster/elections/${election.id}`}
              className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    {election.subject}
                  </h2>
                  <p className="text-gray-600">
                    期間: {new Date(election.start_date).toLocaleDateString()} -{" "}
                    {new Date(election.end_date).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-blue-600 hover:text-blue-800">
                  詳細を見る →
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
