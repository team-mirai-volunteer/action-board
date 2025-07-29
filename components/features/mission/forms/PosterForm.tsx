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

type PosterFormProps = {
  disabled: boolean;
};

export function PosterForm({ disabled }: PosterFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="posterType">
          ポスター種類 <span className="text-red-500">*</span>
        </Label>
        <Select name="posterType" disabled={disabled} required>
          <SelectTrigger>
            <SelectValue placeholder="ポスター種類を選択してください" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A4">A4サイズ</SelectItem>
            <SelectItem value="A3">A3サイズ</SelectItem>
            <SelectItem value="B4">B4サイズ</SelectItem>
            <SelectItem value="B3">B3サイズ</SelectItem>
            <SelectItem value="その他">その他</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="posterCount">
          掲示枚数 <span className="text-red-500">*</span>
        </Label>
        <Input
          type="number"
          name="posterCount"
          id="posterCount"
          min="1"
          max="1000"
          required
          disabled={disabled}
          placeholder="例：10"
        />
        <p className="text-xs text-gray-500">掲示した枚数を入力してください</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="posterLocation">掲示場所 (任意)</Label>
        <Textarea
          name="posterLocation"
          id="posterLocation"
          placeholder="掲示した場所の詳細を入力してください"
          rows={3}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
