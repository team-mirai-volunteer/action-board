"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Database } from "@/lib/types/supabase";
import { Info, MapPin } from "lucide-react";
import { useState } from "react";
import { AddressSearch } from "./AddressSearch";
import { AdminBoundaryMap } from "./AdminBoundaryMap";

type AdminBoundary = Database["public"]["Tables"]["admin_boundaries"]["Row"];

interface AdminBoundaryViewerProps {
  className?: string;
  mapHeight?: number;
}

export function AdminBoundaryViewer({
  className = "",
  mapHeight = 500,
}: AdminBoundaryViewerProps) {
  const [selectedBoundary, setSelectedBoundary] =
    useState<AdminBoundary | null>(null);

  const handleAddressSelect = (boundary: AdminBoundary) => {
    setSelectedBoundary(boundary);
  };

  return (
    <div className={`w-full flex flex-col ${className}`}>
      {/* ヘッダー */}
      <div className="flex-shrink-0 bg-white border-b p-3 lg:p-4">
        <h1 className="text-lg lg:text-xl font-bold flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          行政区域検索・マップ表示
        </h1>
        <p className="text-gray-600 text-xs lg:text-sm mt-1">
          住所を検索して行政区域をマップで確認できます
        </p>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* 左サイドバー/上部: 検索と詳細情報 */}
        <div className="w-full lg:w-56 xl:w-64 2xl:w-72 lg:flex-shrink-0 bg-gray-50 border-b lg:border-b-0 lg:border-r overflow-y-auto lg:max-h-full max-h-60">
          <div className="p-2 lg:p-3 space-y-2 lg:space-y-3">
            {/* ...existing code... */}
            <AddressSearch
              onAddressSelect={handleAddressSelect}
              className="w-full"
            />

            {/* ...existing code... */}
            {selectedBoundary && (
              <Card className="text-xs">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-1 text-sm">
                    <Info className="h-3 w-3" />
                    選択した行政区域
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <h3 className="font-semibold text-xs mb-1 line-clamp-2">
                      {selectedBoundary.full_address}
                    </h3>
                    <div className="space-y-1 text-xs">
                      <div className="flex">
                        <span className="font-medium w-12 text-gray-600 flex-shrink-0">
                          都道府県:
                        </span>
                        <span className="truncate">
                          {selectedBoundary.prefecture_name}
                        </span>
                      </div>
                      {selectedBoundary.city_name && (
                        <div className="flex">
                          <span className="font-medium w-12 text-gray-600 flex-shrink-0">
                            市区町村:
                          </span>
                          <span className="truncate">
                            {selectedBoundary.city_name}
                          </span>
                        </div>
                      )}
                      {selectedBoundary.district_name && (
                        <div className="flex">
                          <span className="font-medium w-12 text-gray-600 flex-shrink-0">
                            地区:
                          </span>
                          <span className="truncate">
                            {selectedBoundary.district_name}
                          </span>
                        </div>
                      )}
                      {selectedBoundary.additional_code && (
                        <div className="flex">
                          <span className="font-medium w-12 text-gray-600 flex-shrink-0">
                            コード:
                          </span>
                          <span className="font-mono text-xs truncate">
                            {selectedBoundary.additional_code}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* GeoJSONプロパティ（XL画面以上でのみ表示） */}
                  <details className="text-xs hidden xl:block">
                    <summary className="font-medium text-gray-600 cursor-pointer hover:text-gray-800 text-xs">
                      詳細情報
                    </summary>
                    <div className="mt-1 text-xs space-y-1">
                      {selectedBoundary.area_name && (
                        <div>エリア: {selectedBoundary.area_name}</div>
                      )}
                      <div>
                        登録日:{" "}
                        {new Date(
                          selectedBoundary.created_at,
                        ).toLocaleDateString("ja-JP")}
                      </div>
                    </div>
                  </details>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* 右側/下部: マップ表示 */}
        <div className="flex-1 min-w-0 relative bg-gray-100 min-h-[500px]">
          <div className="absolute inset-0 w-full h-full">
            <AdminBoundaryMap
              adminBoundary={selectedBoundary}
              height={0} // 親要素のフル高さを使用
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
