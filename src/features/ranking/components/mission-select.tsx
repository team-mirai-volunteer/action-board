"use client";

import { ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  groupMissionsByCategory,
  type MissionWithCategory,
} from "../utils/mission-grouping";

interface MissionSelectProps {
  missions: MissionWithCategory[];
}

export function MissionSelect({ missions }: MissionSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedMissionId, setSelectedMissionId] = useState<string>("");

  // ミッションをカテゴリ別にグループ化
  const groupedMissions = useMemo(
    () => groupMissionsByCategory(missions),
    [missions],
  );

  useEffect(() => {
    // URLからmissionIdパラメータを取得
    const params = new URLSearchParams(window.location.search);
    const missionIdFromUrl = params.get("missionId");

    if (missionIdFromUrl) {
      setSelectedMissionId(missionIdFromUrl);
    } else if (missions.length > 0 && !selectedMissionId) {
      setSelectedMissionId(missions[0].id);
    }
  }, [missions, selectedMissionId]);

  const handleMissionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const missionId = e.target.value;
    setSelectedMissionId(missionId);
    // 現在のURLパラメータを保持
    const params = new URLSearchParams(window.location.search);
    params.set("missionId", missionId);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="">
      <div className="relative">
        <label
          htmlFor="mission-select"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          ミッションを選択
        </label>
        <div className="relative">
          <select
            id="mission-select"
            value={selectedMissionId}
            onChange={handleMissionChange}
            className="w-full p-3 pl-4 pr-10 text-base border border-gray-300 rounded-lg 
                     bg-white appearance-none cursor-pointer
                     focus:outline-hidden focus:ring-2 focus:ring-teal-50 focus:border-teal-400
                     hover:border-teal-400 transition-colors duration-200"
          >
            {/* カテゴリ別にグループ化されたミッション */}
            {groupedMissions.sortedCategories.map(
              ([categoryId, { category, missions: categoryMissions }]) => (
                <optgroup key={categoryId} label={category}>
                  {categoryMissions.map((mission) => (
                    <option key={mission.id} value={mission.id}>
                      {mission.title}
                    </option>
                  ))}
                </optgroup>
              ),
            )}

            {/* カテゴリなしのミッション */}
            {groupedMissions.uncategorized.length > 0 && (
              <optgroup label="その他">
                {groupedMissions.uncategorized.map((mission) => (
                  <option key={mission.id} value={mission.id}>
                    {mission.title}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>
    </div>
  );
}
