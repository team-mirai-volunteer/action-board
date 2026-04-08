"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type PlacementFormProps = {
  lat: number;
  lng: number;
  mode: "create" | "edit";
  isSubmitting: boolean;
  isLoadingAddress: boolean;
  address: string;
  memo: string;
  count: number;
  onAddressChange: (value: string) => void;
  onMemoChange: (value: string) => void;
  onCountChange: (value: number) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onDelete?: () => void;
};

export function PlacementForm({
  lat,
  lng,
  mode,
  isSubmitting,
  isLoadingAddress,
  address,
  memo,
  count,
  onAddressChange,
  onMemoChange,
  onCountChange,
  onSubmit,
  onCancel,
  onDelete,
}: PlacementFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="absolute bottom-4 left-4 right-4 z-20 mx-auto max-w-md">
      <form
        onSubmit={handleSubmit}
        className="rounded-lg bg-white p-4 shadow-lg"
      >
        <h3 className="mb-3 font-semibold text-lg">
          {mode === "edit" ? "掲示情報を編集" : "ポスター掲示を登録"}
        </h3>
        <p className="mb-3 text-gray-600 text-sm">
          選択された位置: {lat.toFixed(6)}, {lng.toFixed(6)}
        </p>

        <div className="mb-4">
          <label
            htmlFor="placement-address"
            className="mb-1 block font-medium text-sm"
          >
            住所（詳細は<span className="font-bold">公開されません</span>）
          </label>
          {isLoadingAddress ? (
            <div className="flex h-10 items-center rounded-md border border-gray-300 px-3">
              <span className="text-gray-400 text-sm">住所を取得中...</span>
            </div>
          ) : (
            <Input
              id="placement-address"
              type="text"
              value={address}
              onChange={(e) => onAddressChange(e.target.value)}
              placeholder="住所を入力"
            />
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="placement-count"
            className="mb-1 block font-medium text-sm"
          >
            掲示枚数
          </label>
          <Input
            id="placement-count"
            type="number"
            min={1}
            value={count}
            onChange={(e) => onCountChange(Number(e.target.value) || 1)}
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="placement-memo"
            className="mb-1 block font-medium text-sm"
          >
            メモ
          </label>
          <Textarea
            id="placement-memo"
            value={memo}
            onChange={(e) => onMemoChange(e.target.value)}
            placeholder="自由記入欄"
            rows={2}
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {mode === "edit" ? "更新中..." : "登録中..."}
              </span>
            ) : mode === "edit" ? (
              "更新する"
            ) : (
              "登録する"
            )}
          </Button>
          {mode === "edit" && onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              disabled={isSubmitting}
            >
              削除
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
        </div>
      </form>
    </div>
  );
}
