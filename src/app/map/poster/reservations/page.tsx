import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserReservationStats } from "@/features/map-poster/services/poster-boards";
import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "予約/完了一覧 - ポスター掲示板マップ",
  description: "ユーザー別のポスター掲示板の予約・完了状況を確認できます",
};

export default async function ReservationsPage() {
  const stats = await getUserReservationStats();

  // 全体の合計を計算
  const totals = stats.reduce(
    (acc, user) => ({
      reserved: acc.reserved + user.reservedCount,
      completed: acc.completed + user.completedCount,
    }),
    { reserved: 0, completed: 0 },
  );

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4">
      {/* Header */}
      <div className="space-y-2">
        <Link
          href="/map/poster"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          ポスター掲示板マップに戻る
        </Link>
        <h1 className="text-2xl font-bold">予約/完了一覧</h1>
        <p className="text-muted-foreground">
          ユーザー別のポスター掲示板の予約・完了状況
        </p>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>全体の合計</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{stats.length}</div>
              <div className="text-sm text-muted-foreground">参加者数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {totals.reserved.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">予約数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {totals.completed.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">完了数</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Stats Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>ユーザー別統計</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              まだデータがありません
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="w-12 py-3 text-left font-medium text-muted-foreground">
                      #
                    </th>
                    <th className="py-3 text-left font-medium">ユーザー</th>
                    <th className="py-3 text-right font-medium">予約</th>
                    <th className="py-3 text-right font-medium">完了</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((user, index) => (
                    <tr key={user.userId} className="border-b last:border-0">
                      <td className="py-3 font-medium text-muted-foreground">
                        {index + 1}
                      </td>
                      <td className="py-3">
                        <Link
                          href={`/users/${user.userId}`}
                          className="hover:underline"
                        >
                          {user.userName}
                        </Link>
                      </td>
                      <td className="py-3 text-right text-blue-600">
                        {user.reservedCount.toLocaleString()}
                      </td>
                      <td className="py-3 text-right text-green-600">
                        {user.completedCount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
