"use client";

import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PrefectureTeamRanking as PrefectureTeamRankingType } from "../types/prefecture-team-types";
import { PrefectureTeamItem } from "./prefecture-team-item";

// マップコンポーネントはSSR無効化（Leafletはクライアントのみ）
const PrefectureTeamMap = dynamic(() => import("./prefecture-team-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] md:h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-gray-500">地図を読み込み中...</div>
    </div>
  ),
});

interface PrefectureTeamTabsProps {
  rankings: PrefectureTeamRankingType[];
  userPrefecture?: string | null;
}

export function PrefectureTeamTabs({
  rankings,
  userPrefecture,
}: PrefectureTeamTabsProps) {
  return (
    <Tabs defaultValue="ranking" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="ranking" className="flex items-center gap-2">
          <span>📊</span>
          <span>ランキング表</span>
        </TabsTrigger>
        <TabsTrigger value="map" className="flex items-center gap-2">
          <span>🗾</span>
          <span>地図</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="ranking" className="mt-4">
        {rankings.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            まだデータがありません
          </Card>
        ) : (
          <Card className="border-2 border-gray-200 rounded-2xl p-4 md:p-6">
            {/* テーブルヘッダー */}
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-2 md:gap-x-4 text-xs md:text-sm text-gray-500 px-2 pb-2 border-b">
              <div className="w-8 text-center">順位</div>
              <div>都道府県</div>
              <div className="text-right">チームパワー</div>
            </div>
            {/* ランキングアイテム */}
            <div className="divide-y">
              {rankings.map((item) => (
                <PrefectureTeamItem
                  key={item.prefecture}
                  ranking={item}
                  isUserPrefecture={item.prefecture === userPrefecture}
                />
              ))}
            </div>
          </Card>
        )}
      </TabsContent>
      <TabsContent value="map" className="mt-4">
        <PrefectureTeamMap
          rankings={rankings}
          userPrefecture={userPrefecture}
        />
      </TabsContent>
    </Tabs>
  );
}
