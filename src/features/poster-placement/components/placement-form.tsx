"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type AddressInfo = {
  prefecture: string | null;
  city: string | null;
  address: string | null;
  postcode: string | null;
};

type PlacementFormProps = {
  lat: number;
  lng: number;
  isSubmitting: boolean;
  addressInfo: AddressInfo | null;
  isLoadingAddress: boolean;
  onSubmit: (count: number, address: string | null) => void;
  onCancel: () => void;
};

function formatAddress(info: AddressInfo): string {
  return [info.prefecture, info.city, info.address].filter(Boolean).join(" ");
}

export function PlacementForm({
  lat,
  lng,
  isSubmitting,
  addressInfo,
  isLoadingAddress,
  onSubmit,
  onCancel,
}: PlacementFormProps) {
  const countRef = useRef<HTMLInputElement>(null);
  const [address, setAddress] = useState("");

  // 逆ジオコーディング結果が届いたら住所欄を自動入力
  useEffect(() => {
    if (addressInfo) {
      setAddress(formatAddress(addressInfo));
    }
  }, [addressInfo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const count = Number(countRef.current?.value ?? 1);
    onSubmit(count, address || null);
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
            htmlFor="placement-address"
            className="mb-1 block font-medium text-sm"
          >
            住所
          </label>
          {isLoadingAddress ? (
            <div className="flex h-10 items-center rounded-md border border-gray-300 px-3">
              <span className="text-gray-400 text-sm">住所を取得中...</span>
            </div>
          ) : (
            <input
              id="placement-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="住所を入力"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          )}
          <p className="mt-1 text-gray-400 text-xs">
            住所の詳細は公開されません
          </p>
        </div>

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
