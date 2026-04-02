"use client";

import { useEffect, useState } from "react";
import { loadCityDetail } from "../loaders/poster-placement-loaders";
import type { CityContributor } from "../types/poster-tracking-types";

interface CityDetailPopupProps {
  prefecture: string;
  city: string;
  totalCount: number;
  contributorCount: number;
}

export function CityDetailPopup({
  prefecture,
  city,
  totalCount,
  contributorCount,
}: CityDetailPopupProps) {
  const [contributors, setContributors] = useState<CityContributor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    loadCityDetail(prefecture, city)
      .then(setContributors)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [prefecture, city]);

  return (
    <div className="min-w-48">
      <div className="font-bold text-sm mb-1">
        {prefecture} {city}
      </div>
      <div className="text-xs text-gray-600 mb-2">
        合計 {totalCount}枚 / {contributorCount}人
      </div>
      {loading ? (
        <div className="text-xs text-gray-400">読み込み中...</div>
      ) : (
        <div className="space-y-1">
          {contributors.map((c) => (
            <div key={c.display_name} className="flex justify-between text-xs">
              <span>{c.display_name}</span>
              <span className="font-medium">{c.total_count}枚</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
