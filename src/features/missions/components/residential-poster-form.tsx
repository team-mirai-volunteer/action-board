"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type ResidentialPosterMissionFormProps = {
  disabled: boolean;
};

export function ResidentialPosterMissionForm({
  disabled,
}: ResidentialPosterMissionFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <p>原則ポスター掲示マップ上での報告をお願いします。</p>
        <p>
          ポスター掲示マップ上で報告をすることで、自動的にミッションクリアとなります。
        </p>
        <Button
          size={"lg"}
          className="w-full my-4"
          onClick={() =>
            window.open(
              "/map/poster-residential",
              "_blank",
              "noopener,noreferrer",
            )
          }
        >
          私有地ポスターマップを開く
        </Button>

        <Separator className="my-4" />
        <p>
          ポスター掲示マップで報告できない場合は以下のフォームに入力してください。
        </p>
      </div>

      {/* 掲示枚数 */}
      <div className="space-y-2">
        <Label htmlFor="residentialPosterCount">
          掲示枚数 <span className="text-red-500">*</span>
        </Label>
        <Input
          type="number"
          name="residentialPosterCount"
          id="residentialPosterCount"
          min="1"
          required
          disabled={disabled}
          placeholder="例：1"
        />
        <p className="text-xs text-gray-500">掲示した枚数を入力してください</p>
      </div>

      {/* 郵便番号 */}
      <div className="space-y-2">
        <Label htmlFor="locationText">掲示場所の郵便番号（ハイフンなし）</Label>
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
