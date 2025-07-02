"use client";

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
import { MAX_POSTER_COUNT, POSTER_POINTS_PER_UNIT } from "@/lib/constants";
import { VALID_JP_PREFECTURES } from "@/lib/constants/poster-prefectures";
import { useState } from "react";

type PosterFormProps = {
  disabled: boolean;
};

export function PosterForm({ disabled }: PosterFormProps) {
  const [selectedPrefecture, setSelectedPrefecture] = useState<string>("");

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="posterCount">
          ポスター枚数 <span className="text-red-500">*</span>
        </Label>
        <Input
          type="number"
          name="posterCount"
          id="posterCount"
          min="1"
          max={MAX_POSTER_COUNT}
          required
          disabled={disabled}
          placeholder="例：10"
        />
        <p className="text-xs text-gray-500">
          貼り付けた枚数を入力してください（1枚＝{POSTER_POINTS_PER_UNIT}
          ポイント）
        </p>
      </div>

      {/* 都道府県 */}
      <div className="space-y-2">
        <Label htmlFor="prefecture">
          都道府県 <span className="text-red-500">*</span>
        </Label>
        <Select
          disabled={disabled}
          required
          value={selectedPrefecture}
          onValueChange={setSelectedPrefecture}
        >
          <SelectTrigger>
            <SelectValue placeholder="都道府県を選択してください" />
          </SelectTrigger>
          <SelectContent>
            {VALID_JP_PREFECTURES.map((prefecture) => (
              <SelectItem key={prefecture} value={prefecture}>
                {prefecture}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="hidden" name="prefecture" value={selectedPrefecture} />
      </div>

      {/* 市町村＋区 */}
      <div className="space-y-2">
        <Label htmlFor="city">
          市町村＋区 <span className="text-red-500">*</span>
        </Label>
        <Input
          type="text"
          name="city"
          id="city"
          required
          maxLength={100}
          disabled={disabled}
          placeholder="例：渋谷区、名古屋市中区"
        />
        <p className="text-xs text-gray-500">
          市町村名と区名を入力してください
        </p>
      </div>

      {/* 番号 */}
      <div className="space-y-2">
        <Label htmlFor="boardNumber">
          番号 <span className="text-red-500">*</span>
        </Label>
        <Input
          type="text"
          name="boardNumber"
          id="boardNumber"
          required
          maxLength={20}
          disabled={disabled}
          placeholder="例：10-1、27-2"
          pattern="^[A-Za-z0-9]+-[A-Za-z0-9]+$"
        />
        <p className="text-xs text-gray-500">
          「番号-番号」の形式で入力してください（例：10-1、27-2）
        </p>
      </div>

      {/* 名前（オプショナル） */}
      <div className="space-y-2">
        <Label htmlFor="boardName">名前</Label>
        <Input
          type="text"
          name="boardName"
          id="boardName"
          maxLength={100}
          disabled={disabled}
          placeholder="例：東小学校前、駅前商店街"
        />
        <p className="text-xs text-gray-500">
          場所の目印があれば入力してください
        </p>
      </div>

      {/* 状況（オプショナル） */}
      <div className="space-y-2">
        <Label htmlFor="boardNote">状況</Label>
        <Textarea
          name="boardNote"
          id="boardNote"
          rows={2}
          maxLength={200}
          disabled={disabled}
          placeholder="例：破損していました、古いポスターが貼られていました"
        />
        <p className="text-xs text-gray-500">
          ポスター掲示板の状況について特記事項があれば入力してください
        </p>
      </div>

      {/* 住所（オプショナル） */}
      <div className="space-y-2">
        <Label htmlFor="boardAddress">住所</Label>
        <Input
          type="text"
          name="boardAddress"
          id="boardAddress"
          maxLength={200}
          disabled={disabled}
          placeholder="例：東京都渋谷区神南1-1-1"
        />
        <p className="text-xs text-gray-500">
          詳細な住所がわかれば入力してください
        </p>
      </div>

      {/* 緯度・経度（オプショナル） */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="boardLat">緯度</Label>
            <Input
              type="number"
              name="boardLat"
              id="boardLat"
              step="any"
              min="-90"
              max="90"
              disabled={disabled}
              placeholder="例：35.6762"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="boardLong">経度</Label>
            <Input
              type="number"
              name="boardLong"
              id="boardLong"
              step="any"
              min="-180"
              max="180"
              disabled={disabled}
              placeholder="例：139.6503"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500">
          正確な位置情報がわかれば入力してください
        </p>
      </div>
    </div>
  );
}
