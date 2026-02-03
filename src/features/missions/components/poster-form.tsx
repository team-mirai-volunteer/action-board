"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { VALID_JP_PREFECTURES } from "@/features/map-poster/constants/poster-prefectures";

type PosterFormProps = {
  disabled: boolean;
};

export function PosterForm({ disabled }: PosterFormProps) {
  const [selectedPrefecture, setSelectedPrefecture] = useState<string>("");

  return (
    <div className="space-y-4">
      <div>
        <p>原則ポスターマップ上での報告をお願いします。</p>
        <p>
          ポスターマップ上で報告をすることで、自動的にミッションクリアとなります。
        </p>
        <Button
          size={"lg"}
          className="w-full my-4"
          onClick={
            // 新しいタブでポスターマップを開く
            () => window.open("/map/poster", "_blank", "noopener,noreferrer")
          }
        >
          ポスターマップを開く
        </Button>

        <Separator className="my-4" />
        <p>
          ポスターマップ上にデータが見つからないなど、マップで報告できない場合は以下のフォームに入力してください。
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

      {/* 掲示板番号 */}
      <div className="space-y-2">
        <Label htmlFor="boardNumber">
          掲示板番号 <span className="text-red-500">*</span>
        </Label>
        <Input
          type="text"
          name="boardNumber"
          id="boardNumber"
          required
          maxLength={20}
          disabled={disabled}
          placeholder="例：10-1、27-2-1、00"
          pattern="^(\d+(-\d){0,2})$"
        />
        <p className="text-xs text-gray-500">
          掲示板番号を入力してください（例：10-1、27-2-1、00）
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
