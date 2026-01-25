"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  MAX_POSTING_COUNT,
  POSTING_POINTS_PER_UNIT,
} from "@/lib/constants/mission-config";

type PostingFormProps = {
  disabled: boolean;
};

export function PostingForm({ disabled }: PostingFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <p>原則ポスティングマップ上での報告をお願いします。</p>
        <p>
          ポスティングマップ上で報告をすることで、自動的にミッションクリアとなります。
        </p>
        <Button
          size={"lg"}
          className="w-full my-4"
          onClick={
            // 新しいタブでポスティングマップを開く
            () => window.open("/map/posting", "_blank", "noopener,noreferrer")
          }
        >
          ポスティングマップを開く
        </Button>

        <Separator className="my-4" />
        <p>
          ポスティングマップで報告できない場合は以下のフォームに入力してください。
        </p>
      </div>

      {/* 配布枚数 */}
      <div className="space-y-2">
        <Label htmlFor="postingCount">
          ポスティング・配布枚数 <span className="text-red-500">*</span>
        </Label>
        <Input
          type="number"
          name="postingCount"
          id="postingCount"
          min="1"
          max={MAX_POSTING_COUNT}
          required
          disabled={disabled}
          placeholder="例：50"
        />
        <p className="text-xs text-gray-500">
          配布した枚数を入力してください（1枚＝{POSTING_POINTS_PER_UNIT}
          ポイント）
        </p>
      </div>

      {/* 郵便番号 */}
      <div className="space-y-2">
        <Label htmlFor="locationText">
          ポスティング・配布場所の郵便番号（ハイフンなし）
        </Label>
        <Input
          type="text"
          name="locationText"
          id="locationText"
          maxLength={100}
          disabled={disabled}
          placeholder="例：1540017"
        />
        <p className="text-xs text-gray-500">
          対象エリアの郵便番号をご入力ください
        </p>
      </div>
    </div>
  );
}
