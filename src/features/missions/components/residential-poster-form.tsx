"use client";

import { useEffect, useState } from "react";
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
import {
  LOCATION_TYPES,
  type LocationTypeValue,
} from "@/features/map-poster-residential/constants/location-types";

type ResidentialPosterMissionFormProps = {
  disabled: boolean;
  onValidityChange?: (isValid: boolean) => void;
};

const POSTAL_CODE_REGEX = /^\d{7}$/;

export function ResidentialPosterMissionForm({
  disabled,
  onValidityChange,
}: ResidentialPosterMissionFormProps) {
  const [locationType, setLocationType] = useState<LocationTypeValue | "">("");
  const [placedDate, setPlacedDate] = useState("");
  const [posterCount, setPosterCount] = useState("");
  const [locationText, setLocationText] = useState("");
  const [postalCodeTouched, setPostalCodeTouched] = useState(false);

  const isPostalCodeValid =
    locationText.length > 0 && POSTAL_CODE_REGEX.test(locationText);
  const showPostalCodeError =
    postalCodeTouched && locationText.length > 0 && !isPostalCodeValid;

  const isFormValid =
    Number(posterCount) >= 1 &&
    locationType !== "" &&
    placedDate !== "" &&
    isPostalCodeValid;

  useEffect(() => {
    onValidityChange?.(isFormValid);
  }, [isFormValid, onValidityChange]);

  return (
    <div className="space-y-4">
      <div>
        <p>原則ポスター掲示マップ上での報告をお願いします。</p>
        <p>
          ポスター掲示マップ上で報告をすることで、自動的にミッションクリアとなります。
        </p>
        <Button
          type="button"
          size={"lg"}
          className="w-full my-4"
          disabled={disabled}
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

      {/* hidden input for Select value (Radix Select doesn't natively submit via FormData) */}
      <input type="hidden" name="locationType" value={locationType} />

      {/* 種別 */}
      <div className="space-y-2">
        <Label htmlFor="locationType">
          種別 <span className="text-red-500">*</span>
        </Label>
        <Select
          value={locationType}
          onValueChange={(v) => setLocationType(v as LocationTypeValue | "")}
          disabled={disabled}
        >
          <SelectTrigger id="locationType">
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
      </div>

      {/* 貼った日付 */}
      <div className="space-y-2">
        <Label htmlFor="placedDate">
          貼った日付 <span className="text-red-500">*</span>
        </Label>
        <Input
          type="date"
          name="placedDate"
          id="placedDate"
          value={placedDate}
          onChange={(e) => setPlacedDate(e.target.value)}
          disabled={disabled}
          required
        />
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
          value={posterCount}
          onChange={(e) => setPosterCount(e.target.value)}
        />
        <p className="text-xs text-gray-500">掲示した枚数を入力してください</p>
      </div>

      {/* 郵便番号 */}
      <div className="space-y-2">
        <Label htmlFor="locationText">
          掲示場所の郵便番号（ハイフンなし）{" "}
          <span className="text-red-500">*</span>
        </Label>
        <Input
          type="text"
          name="locationText"
          id="locationText"
          maxLength={7}
          disabled={disabled}
          placeholder="例：1540017"
          value={locationText}
          onChange={(e) => setLocationText(e.target.value)}
          onBlur={() => setPostalCodeTouched(true)}
        />
        {showPostalCodeError ? (
          <p className="text-xs text-red-600">
            郵便番号はハイフンなし7桁で入力をお願いします
          </p>
        ) : (
          <p className="text-xs text-gray-500">
            対象エリアの郵便番号をご入力ください
          </p>
        )}
      </div>
    </div>
  );
}
