"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { statusConfig, statusOptions } from "../config/status-config";
import type { MapShape, PostingShapeStatus } from "../types/posting-types";

interface ShapeStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shape: MapShape | null;
  onStatusUpdate: (
    shapeId: string,
    status: PostingShapeStatus,
    postingCount?: number | null,
  ) => Promise<void>;
  isUpdating: boolean;
}

export function ShapeStatusDialog({
  isOpen,
  onClose,
  shape,
  onStatusUpdate,
  isUpdating,
}: ShapeStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<PostingShapeStatus>(
    shape?.status || "planned",
  );
  const [postingCount, setPostingCount] = useState<string>(
    shape?.posting_count?.toString() || "",
  );

  // Reset form when shape changes
  const handleOpenChange = (open: boolean) => {
    if (open && shape) {
      setSelectedStatus(shape.status || "planned");
      setPostingCount(shape.posting_count?.toString() || "");
    }
    if (!open) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!shape?.id) return;

    const count =
      selectedStatus === "completed"
        ? Number.parseInt(postingCount) || 0
        : null;
    await onStatusUpdate(shape.id, selectedStatus, count);
  };

  const isPostingCountRequired = selectedStatus === "completed";
  const isPostingCountValid =
    !isPostingCountRequired ||
    (postingCount !== "" && Number.parseInt(postingCount) >= 0);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ステータス変更</DialogTitle>
          <DialogDescription>
            この図形のステータスを変更します。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="status">ステータス</Label>
            <Select
              value={selectedStatus}
              onValueChange={(value) =>
                setSelectedStatus(value as PostingShapeStatus)
              }
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="ステータスを選択" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block w-3 h-3 rounded-full ${statusConfig[status].bgColor}`}
                      />
                      {statusConfig[status].label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isPostingCountRequired && (
            <div className="grid gap-2">
              <Label htmlFor="posting-count">
                配布数 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="posting-count"
                type="number"
                min="0"
                value={postingCount}
                onChange={(e) => setPostingCount(e.target.value)}
                placeholder="配布数を入力"
              />
              {!isPostingCountValid && (
                <p className="text-sm text-red-500">
                  配布完了の場合、配布数を入力してください。
                </p>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            キャンセル
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isUpdating || !isPostingCountValid}
          >
            {isUpdating ? "更新中..." : "更新"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
