"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PREFECTURES } from "@/lib/address";
import type React from "react";

type PrefectureSelectProps = {
  name: string;
  id?: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
  placeholder?: string;
};

export const PrefectureSelect: React.FC<PrefectureSelectProps> = ({
  name,
  id,
  defaultValue,
  required,
  disabled,
  onValueChange,
  placeholder = "都道府県を選択",
}) => {
  return (
    <Select
      name={name}
      defaultValue={defaultValue}
      required={required}
      disabled={disabled}
      onValueChange={onValueChange}
    >
      <SelectTrigger id={id || name}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {PREFECTURES.map((pref) => (
          <SelectItem value={pref} key={pref}>
            {pref}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
