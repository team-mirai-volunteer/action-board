"use client";

import { searchAdminBoundariesAction } from "@/app/actions/admin-boundaries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Database } from "@/lib/types/supabase";
import { Loader2, MapPin, Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type AdminBoundary = Database["public"]["Tables"]["admin_boundaries"]["Row"];

interface AddressSearchProps {
  onAddressSelect: (adminBoundary: AdminBoundary) => void;
  className?: string;
}

export function AddressSearch({
  onAddressSelect,
  className,
}: AddressSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AdminBoundary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await searchAdminBoundariesAction(query, 20);

      if (result.error) {
        setError(result.error);
        setSearchResults([]);
      } else {
        setSearchResults(result.data || []);
      }
    } catch (err) {
      setError("検索中にエラーが発生しました");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  // デバウンス付きリアルタイム検索
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
        setError(null);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch]);

  const handleAddressClick = (adminBoundary: AdminBoundary) => {
    onAddressSelect(adminBoundary);
    setSearchQuery(adminBoundary.full_address);
    setSearchResults([]);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setError(null);
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            住所検索
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Input
              placeholder="都道府県名、市区町村名、地域名を入力..."
              value={searchQuery}
              onChange={handleInputChange}
              className="w-full pr-8"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="検索をクリア"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {/* 固定高さの検索結果エリア */}
          <div className="h-64 border rounded overflow-y-auto bg-gray-50">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">検索中...</span>
                </div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="p-2 space-y-2 bg-white">
                {searchResults.map((boundary) => (
                  <button
                    key={boundary.id}
                    type="button"
                    className="w-full p-3 hover:bg-gray-50 cursor-pointer rounded border text-left transition-colors"
                    onClick={() => handleAddressClick(boundary)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {boundary.full_address}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {boundary.prefecture_name}
                          </Badge>
                          {boundary.city_name && (
                            <Badge variant="secondary" className="text-xs">
                              {boundary.city_name}
                            </Badge>
                          )}
                          {boundary.district_name && (
                            <Badge variant="outline" className="text-xs">
                              {boundary.district_name}
                            </Badge>
                          )}
                        </div>
                        {boundary.additional_code && (
                          <div className="text-xs text-gray-500 mt-1">
                            行政区域コード: {boundary.additional_code}
                          </div>
                        )}
                      </div>
                      <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery && !error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <div className="text-2xl mb-2">🔍</div>
                  <div className="text-sm">検索結果がありません</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-400">
                  <div className="text-2xl mb-2">📍</div>
                  <div className="text-sm">住所を入力して検索</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
