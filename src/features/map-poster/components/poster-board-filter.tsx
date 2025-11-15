"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Database } from "@/lib/types/supabase";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import type {
  FilterStatus,
  PosterBoardFilterState,
} from "../hooks/use-poster-board-filter";

type BoardStatus = Database["public"]["Enums"]["poster_board_status"];

interface PosterBoardFilterProps {
  filterState: PosterBoardFilterState;
  onToggleStatus: (status: FilterStatus) => void;
  onToggleShowOnlyMine: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  activeFilterCount: number;
}

const statusConfig: {
  status: BoardStatus;
  label: string;
  color: string;
}[] = [
  { status: "not_yet", label: "未貼付", color: "#6B7280" },
  { status: "not_yet_dangerous", label: "未貼付（危険）", color: "#6B7280" },
  { status: "done", label: "完了", color: "#10B981" },
];

const reservedConfig = {
  status: "reserved" as BoardStatus,
  label: "予約済み",
  color: "#F59E0B",
};

const errorConfig: {
  status: BoardStatus;
  label: string;
  color: string;
}[] = [
  { status: "error_wrong_place", label: "場所違い", color: "#EF4444" },
  { status: "error_damaged", label: "破損", color: "#EF4444" },
  { status: "error_wrong_poster", label: "ポスター違い", color: "#EF4444" },
];

const otherConfig = {
  status: "other" as BoardStatus,
  label: "その他",
  color: "#8B5CF6",
};

export function PosterBoardFilter({
  filterState,
  onToggleStatus,
  onToggleShowOnlyMine,
  onSelectAll,
  onDeselectAll,
  activeFilterCount,
}: PosterBoardFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div
      className={`absolute z-1000 bg-white rounded-lg shadow-lg border border-gray-200 ${
        isMobile ? "poster-filter-mobile" : "right-4 top-4 max-w-xs"
      }`}
      data-expanded={isExpanded}
    >
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2 px-3 py-1.5 w-full hover:bg-gray-50 transition-colors ${
          isExpanded ? "rounded-t-lg" : "rounded-lg"
        }`}
      >
        <Filter className="h-3.5 w-3.5" />
        {!isMobile && <span className="text-sm font-medium">フィルタ</span>}
        {activeFilterCount < 7 && (
          <span
            className={`${isMobile ? "ml-1" : "ml-auto"} text-xs text-gray-500`}
          >
            ({activeFilterCount})
          </span>
        )}
        {isExpanded ? (
          <ChevronUp className={`h-3.5 w-3.5 ${isMobile ? "ml-1" : "ml-2"}`} />
        ) : (
          <ChevronDown
            className={`h-3.5 w-3.5 ${isMobile ? "ml-1" : "ml-2"}`}
          />
        )}
      </button>

      {isExpanded && (
        <div className="p-3 border-t border-gray-200 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto filter-content-scroll">
          <div className="flex gap-2 mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onSelectAll}
              className="text-xs px-2.5 py-1 h-7"
            >
              全て選択
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDeselectAll}
              className="text-xs px-2.5 py-1 h-7"
            >
              全て解除
            </Button>
          </div>

          {/* 自分のものだけを表示 */}
          <div className="border-b border-gray-200 pb-3 mb-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-only-mine"
                checked={filterState.showOnlyMine}
                onCheckedChange={onToggleShowOnlyMine}
              />
              <Label
                htmlFor="show-only-mine"
                className="cursor-pointer text-xs font-medium text-blue-600 select-none"
              >
                自分が更新したもののみ
              </Label>
            </div>
          </div>

          <div className="space-y-3">
            {/* 基本ステータス */}
            <div>
              <h3 className="text-xs font-semibold mb-2 text-gray-700">
                ステータス
              </h3>
              <div className="space-y-1.5">
                {statusConfig.map(({ status, label, color }) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={status}
                      checked={filterState.statuses.has(status)}
                      onCheckedChange={() => onToggleStatus(status)}
                    />
                    <Label
                      htmlFor={status}
                      className="flex items-center gap-2 cursor-pointer text-xs"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white shadow-xs shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="select-none">{label}</span>
                    </Label>
                  </div>
                ))}

                {/* 予約済み */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={reservedConfig.status}
                    checked={filterState.statuses.has(reservedConfig.status)}
                    onCheckedChange={() =>
                      onToggleStatus(reservedConfig.status)
                    }
                  />
                  <Label
                    htmlFor={reservedConfig.status}
                    className="flex items-center gap-2 cursor-pointer text-xs"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-white shadow-xs shrink-0"
                      style={{ backgroundColor: reservedConfig.color }}
                    />
                    <span className="select-none">{reservedConfig.label}</span>
                  </Label>
                </div>
              </div>
            </div>

            {/* エラーステータス */}
            <div>
              <h3 className="text-xs font-semibold mb-2 text-gray-700">
                エラー
              </h3>
              <div className="space-y-1.5">
                {errorConfig.map(({ status, label, color }) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={status}
                      checked={filterState.statuses.has(status)}
                      onCheckedChange={() => onToggleStatus(status)}
                    />
                    <Label
                      htmlFor={status}
                      className="flex items-center gap-2 cursor-pointer text-xs"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white shadow-xs shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="select-none">{label}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* その他 */}
            <div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={otherConfig.status}
                  checked={filterState.statuses.has(otherConfig.status)}
                  onCheckedChange={() => onToggleStatus(otherConfig.status)}
                />
                <Label
                  htmlFor={otherConfig.status}
                  className="flex items-center gap-2 cursor-pointer text-xs"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-white shadow-xs shrink-0"
                    style={{ backgroundColor: otherConfig.color }}
                  />
                  <span className="select-none">{otherConfig.label}</span>
                </Label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
