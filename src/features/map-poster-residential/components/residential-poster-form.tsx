"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  LOCATION_TYPES,
  type LocationTypeValue,
} from "../constants/location-types";
import { POSTER_TYPES, type PosterTypeValue } from "../constants/poster-types";

type PlacementFormProps = {
  lat: number;
  lng: number;
  mode: "create" | "edit";
  isSubmitting: boolean;
  isLoadingAddress: boolean;
  address: string;
  memo: string;
  count: number;
  placedDate: string;
  locationType: LocationTypeValue | "";
  posterType: PosterTypeValue | "";
  isRemoved: boolean;
  confirmedOrdinance: boolean;
  confirmedLandowner: boolean;
  onAddressChange: (value: string) => void;
  onMemoChange: (value: string) => void;
  onCountChange: (value: number) => void;
  onPlacedDateChange: (value: string) => void;
  onLocationTypeChange: (value: LocationTypeValue | "") => void;
  onPosterTypeChange: (value: PosterTypeValue | "") => void;
  onIsRemovedChange: (value: boolean) => void;
  onConfirmedOrdinanceChange: (value: boolean) => void;
  onConfirmedLandownerChange: (value: boolean) => void;
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
  placedDate,
  locationType,
  posterType,
  isRemoved,
  confirmedOrdinance,
  confirmedLandowner,
  onAddressChange,
  onMemoChange,
  onCountChange,
  onPlacedDateChange,
  onLocationTypeChange,
  onPosterTypeChange,
  onIsRemovedChange,
  onConfirmedOrdinanceChange,
  onConfirmedLandownerChange,
  onSubmit,
  onCancel,
  onDelete,
}: PlacementFormProps) {
  const [attempted, setAttempted] = useState(false);

  const canSubmit =
    mode === "edit" || (confirmedOrdinance && confirmedLandowner);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (!address || !placedDate || !locationType || !posterType) return;
    if (!canSubmit) return;
    onSubmit();
  };

  return (
    <div className="absolute bottom-4 left-4 right-4 z-20 mx-auto max-w-md">
      <form
        onSubmit={handleSubmit}
        className="max-h-[80vh] overflow-y-auto rounded-lg bg-white p-4 shadow-lg"
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
          {attempted && !isLoadingAddress && !address && (
            <p className="mt-1 text-red-600 text-xs">必須入力欄です</p>
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
            htmlFor="placement-date"
            className="mb-1 block font-medium text-sm"
          >
            貼った日付
          </label>
          <Input
            id="placement-date"
            type="date"
            value={placedDate}
            onChange={(e) => onPlacedDateChange(e.target.value)}
          />
          {attempted && !placedDate && (
            <p className="mt-1 text-red-600 text-xs">必須入力欄です</p>
          )}
        </div>

        <div className="mb-4">
          <Label
            htmlFor="placement-location-type"
            className="mb-1 block font-medium text-sm"
          >
            種別
          </Label>
          <Select
            value={locationType}
            onValueChange={(v) =>
              onLocationTypeChange(v as LocationTypeValue | "")
            }
          >
            <SelectTrigger id="placement-location-type">
              <SelectValue placeholder="種別を選択" />
            </SelectTrigger>
            <SelectContent>
              {LOCATION_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {attempted && !locationType && (
            <p className="mt-1 text-red-600 text-xs">必須入力欄です</p>
          )}
        </div>

        <div className="mb-4">
          <Label
            htmlFor="placement-poster-type"
            className="mb-1 block font-medium text-sm"
          >
            ポスターの種類
          </Label>
          <Select
            value={posterType}
            onValueChange={(v) => onPosterTypeChange(v as PosterTypeValue | "")}
          >
            <SelectTrigger id="placement-poster-type">
              <SelectValue placeholder="ポスターの種類を選択" />
            </SelectTrigger>
            <SelectContent>
              {POSTER_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {attempted && !posterType && (
            <p className="mt-1 text-red-600 text-xs">必須入力欄です</p>
          )}
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

        {mode === "edit" && (
          <div className="mb-4 flex items-center gap-2">
            <Checkbox
              id="placement-removed"
              checked={isRemoved}
              onCheckedChange={(checked) => onIsRemovedChange(checked === true)}
            />
            <Label htmlFor="placement-removed" className="text-sm">
              剥がしました
            </Label>
          </div>
        )}

        {mode === "create" && (
          <div className="mb-4 rounded-md border border-gray-200 bg-gray-50 p-3">
            <p className="mb-2 font-medium text-sm">
              以下、ポスターの掲示に関し問題ないことを確認しました
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="confirm-ordinance"
                  checked={confirmedOrdinance}
                  onCheckedChange={(checked) =>
                    onConfirmedOrdinanceChange(checked === true)
                  }
                />
                <Label htmlFor="confirm-ordinance" className="text-sm">
                  条例を確認しました
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="confirm-landowner"
                  checked={confirmedLandowner}
                  onCheckedChange={(checked) =>
                    onConfirmedLandownerChange(checked === true)
                  }
                />
                <Label htmlFor="confirm-landowner" className="text-sm">
                  掲示場所の責任者（地権者・所有者等）に確認しました
                </Label>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={isSubmitting || !canSubmit}
            className="flex-1"
          >
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
