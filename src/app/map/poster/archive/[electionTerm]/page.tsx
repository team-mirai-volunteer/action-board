import { Archive, ChevronRight, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageBreadcrumb } from "@/components/common/page-breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { statusConfig } from "@/features/map-poster/config/status-config";
import { JP_TO_EN_PREFECTURE } from "@/features/map-poster/constants/poster-prefectures";
import { getArchivedPosterBoardSummary } from "@/features/map-poster/loaders/poster-boards-loaders";
import type { BoardStatus } from "@/features/map-poster/types/poster-types";
import {
  calculateProgressRate,
  getCompletedCount,
  getRegisteredCount,
} from "@/features/map-poster/utils/poster-progress";

// Election term display names
const ELECTION_TERM_NAMES: Record<string, string> = {
  "sangin-2025": "参議院選挙 2025",
  "shugin-2026": "衆議院選挙 2026",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ electionTerm: string }>;
}): Promise<Metadata> {
  const { electionTerm } = await params;
  const termName = ELECTION_TERM_NAMES[electionTerm] || electionTerm;

  return {
    title: `${termName} - ポスター掲示板マップ アーカイブ`,
    description: `${termName}のポスター掲示板の配置状況（アーカイブ）`,
  };
}

export default async function ArchiveElectionTermPage({
  params,
}: {
  params: Promise<{ electionTerm: string }>;
}) {
  const { electionTerm } = await params;

  // Validate election term
  const termName = ELECTION_TERM_NAMES[electionTerm];
  if (!termName) {
    return notFound();
  }

  // Get archived summary for this election term
  const summary = await getArchivedPosterBoardSummary(electionTerm);

  // Calculate total stats
  let registeredTotal = 0;
  let completed = 0;
  const allStatuses: Record<BoardStatus, number> = {
    not_yet: 0,
    not_yet_dangerous: 0,
    reserved: 0,
    done: 0,
    error_wrong_place: 0,
    error_damaged: 0,
    error_wrong_poster: 0,
    other: 0,
  };

  for (const data of Object.values(summary)) {
    registeredTotal += data.total;
    completed += data.statuses.done || 0;
    for (const [status, count] of Object.entries(data.statuses)) {
      allStatuses[status as BoardStatus] += count;
    }
  }

  const percentage = calculateProgressRate(completed, registeredTotal);

  // Sort prefectures
  const sortedPrefectures = Object.keys(summary).sort((a, b) =>
    a.localeCompare(b, "ja"),
  );

  const getCompletionRate = (stats: Record<BoardStatus, number>) => {
    const registeredTotal = getRegisteredCount(stats);
    const completed = getCompletedCount(stats);
    return calculateProgressRate(completed, registeredTotal);
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-4">
      <PageBreadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "ポスター掲示板マップ", href: "/map/poster" },
          { label: termName },
        ]}
      />

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Archive className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold">
            ポスター掲示板マップ アーカイブ
          </h1>
        </div>
        <p className="text-muted-foreground">
          {termName}のデータ（読み取り専用）
        </p>
      </div>

      {/* Archive Notice */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-800">
          このページはアーカイブデータです。ステータスの更新はできません。
        </p>
      </div>

      {/* Overall Stats Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>全体の進捗状況</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">
                {registeredTotal.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">総掲示板数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {completed.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">完了</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {percentage}%
              </div>
              <div className="text-sm text-muted-foreground">達成率</div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>進捗</span>
              <span className="font-medium">{percentage}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-linear-to-r from-blue-500 to-green-500 transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
          {/* ステータス詳細 */}
          <div className="mt-4 border-t pt-4">
            <div className="mb-2 text-sm font-medium">ステータス内訳</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(allStatuses).map(([status, count]) => {
                if (count === 0) return null;
                const config = statusConfig[status as BoardStatus];
                return (
                  <div key={status} className="flex items-center gap-1">
                    <div className={`h-2 w-2 rounded-full ${config.color}`} />
                    <span className="text-xs text-muted-foreground">
                      {config.label}: {count.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prefecture List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">都道府県から選択</h2>
        {sortedPrefectures.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              このアーカイブにはデータがありません
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedPrefectures.map((prefectureJp) => {
              const prefectureKey =
                JP_TO_EN_PREFECTURE[prefectureJp] ||
                prefectureJp.toLowerCase().replace(/[^a-z0-9]/g, "-");
              const stats = summary[prefectureJp]?.statuses || {
                not_yet: 0,
                not_yet_dangerous: 0,
                reserved: 0,
                done: 0,
                error_wrong_place: 0,
                error_damaged: 0,
                error_wrong_poster: 0,
                other: 0,
              };
              const registeredInPrefecture = Object.values(stats).reduce(
                (sum, count) => sum + count,
                0,
              );
              const completionRate = getCompletionRate(stats);

              return (
                <Link
                  key={prefectureJp}
                  href={`/map/poster/archive/${electionTerm}/${prefectureKey}`}
                  className="block"
                >
                  <Card className="transition-all hover:shadow-lg">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <CardTitle className="text-lg">
                              {prefectureJp}
                            </CardTitle>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            掲示板数: {registeredInPrefecture.toLocaleString()}
                          </span>
                          <span className="font-medium">{completionRate}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full bg-linear-to-r from-blue-500 to-green-500 transition-all duration-300"
                            style={{ width: `${completionRate}%` }}
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(stats).map(([status, count]) => {
                            if (count === 0) return null;
                            const config = statusConfig[status as BoardStatus];
                            return (
                              <div
                                key={status}
                                className="flex items-center gap-1"
                              >
                                <div
                                  className={`h-2 w-2 rounded-full ${config.color}`}
                                />
                                <span className="text-xs text-muted-foreground">
                                  {config.label}: {count.toLocaleString()}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col items-center gap-4 pt-4">
        <Button size="lg" variant="outline" asChild>
          <Link href="/map/poster">
            現在のポスター掲示板マップに戻る
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
