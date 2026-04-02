"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";

type PlacementFormProps = {
  lat: number;
  lng: number;
  isSubmitting: boolean;
  onSubmit: (count: number) => void;
  onCancel: () => void;
};

export function PlacementForm({
  lat,
  lng,
  isSubmitting,
  onSubmit,
  onCancel,
}: PlacementFormProps) {
  const countRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const count = Number(countRef.current?.value ?? 1);
    onSubmit(count);
  };

  return (
    <div className="absolute bottom-4 left-4 right-4 z-20 mx-auto max-w-md">
      <form
        onSubmit={handleSubmit}
        className="rounded-lg bg-white p-4 shadow-lg"
      >
        <h3 className="mb-3 font-semibold text-lg">ポスター掲示を登録</h3>
        <p className="mb-3 text-gray-600 text-sm">
          選択された位置: {lat.toFixed(6)}, {lng.toFixed(6)}
        </p>
        <div className="mb-4">
          <label
            htmlFor="placement-count"
            className="mb-1 block font-medium text-sm"
          >
            掲示枚数
          </label>
          <input
            ref={countRef}
            id="placement-count"
            type="number"
            min={1}
            defaultValue={1}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                登録中...
              </span>
            ) : (
              "登録する"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            キャンセル
          </Button>
        </div>
      </form>
    </div>
  );
}
