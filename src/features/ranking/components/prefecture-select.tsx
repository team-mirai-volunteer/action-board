"use client";

import { ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface PrefectureSelectProps {
  prefectures: string[];
  selectedPrefecture?: string;
}

export function PrefectureSelect({
  prefectures,
  selectedPrefecture,
}: PrefectureSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentPrefecture, setCurrentPrefecture] = useState<string>(
    selectedPrefecture || "",
  );

  useEffect(() => {
    if (selectedPrefecture) {
      setCurrentPrefecture(selectedPrefecture);
    }
  }, [selectedPrefecture]);

  const handlePrefectureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const prefecture = e.target.value;
    setCurrentPrefecture(prefecture);
    // 現在のURLパラメータを保持
    const params = new URLSearchParams(window.location.search);
    params.set("prefecture", prefecture);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="">
      <div className="relative">
        <label
          htmlFor="prefecture-select"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          都道府県を選択
        </label>
        <div className="relative">
          <select
            id="prefecture-select"
            value={currentPrefecture}
            onChange={handlePrefectureChange}
            className="w-full p-3 pl-4 pr-10 text-base border border-gray-300 rounded-lg 
                     bg-white appearance-none cursor-pointer
                     focus:outline-none focus:ring-2 focus:ring-teal-50 focus:border-teal-400
                     hover:border-teal-400 transition-colors duration-200"
          >
            {prefectures.map((prefecture) => (
              <option key={prefecture} value={prefecture}>
                {prefecture}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>
    </div>
  );
}
