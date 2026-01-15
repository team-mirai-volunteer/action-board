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
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  type PostingShapeStatus,
  postingStatusBadgeColors,
  postingStatusConfig,
} from "../config/status-config";
import { completePostingMission } from "../services/posting-mission";
import {
  getShapeMissionStatus,
  updateShapeStatus,
} from "../services/posting-shapes";
import type { MapShape } from "../types/posting-types";

interface ShapeStatusDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  shape: MapShape | null;
  currentUserId: string;
  onStatusUpdated: (
    id: string,
    newStatus: PostingShapeStatus,
    newMemo: string | null,
  ) => void;
}

export function ShapeStatusDialog({
  isOpen,
  onOpenChange,
  shape,
  currentUserId,
  onStatusUpdated,
}: ShapeStatusDialogProps) {
  // Check if the current user owns this shape
  const isOwner = shape?.user_id === currentUserId || !shape?.user_id;
  const [selectedStatus, setSelectedStatus] =
    useState<PostingShapeStatus>("planned");
  const [postingCount, setPostingCount] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMissionCompleted, setIsMissionCompleted] = useState(false);
  const [completedPostingCount, setCompletedPostingCount] = useState<
    number | null
  >(null);
  const [memo, setMemo] = useState<string>("");

  // ダイアログ開時にミッション達成状況を取得
  useEffect(() => {
    if (shape?.id && isOpen) {
      setSelectedStatus(shape.status || "planned");
      setMemo(shape.memo || "");
      setPostingCount(null);
      setIsLoading(true);

      getShapeMissionStatus(shape.id)
        .then((status) => {
          setIsMissionCompleted(status.isCompleted);
          if (status.postingCount) {
            setCompletedPostingCount(status.postingCount);
          } else {
            setCompletedPostingCount(null);
          }
        })
        .catch((error) => {
          console.error("Failed to fetch mission status:", error);
          toast.error("ミッション状況の取得に失敗しました");
        })
        .finally(() => setIsLoading(false));
    }
  }, [shape, isOpen]);

  const canSubmit = useMemo(() => {
    if (selectedStatus === "completed" && !isMissionCompleted) {
      return postingCount !== null && postingCount > 0;
    }
    return true;
  }, [selectedStatus, postingCount, isMissionCompleted]);

  const handleStatusUpdate = async () => {
    if (!shape?.id) return;

    setIsUpdating(true);
    try {
      // 1. ステータスとメモを更新
      await updateShapeStatus(shape.id, selectedStatus, memo || null);

      // 2. 配布完了 & 未達成の場合、ミッション達成処理
      if (
        selectedStatus === "completed" &&
        postingCount &&
        !isMissionCompleted
      ) {
        const result = await completePostingMission(shape.id, postingCount);

        if (result.success) {
          toast.success(`ミッション達成! +${result.xpGranted}XP獲得`);
          setIsMissionCompleted(true);
          setCompletedPostingCount(postingCount);
        } else {
          toast.error(result.error || "ミッション達成に失敗しました");
          // ミッション達成失敗してもステータス更新は成功しているので続行
        }
      } else {
        toast.success("ステータスを更新しました");
      }

      onStatusUpdated(shape.id, selectedStatus, memo || null);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("更新に失敗しました");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>配布ステータス{isOwner ? "の変更" : ""}</DialogTitle>
          <DialogDescription>
            {isOwner
              ? "選択した図形の配布ステータスを変更します"
              : "この図形は他のユーザーが作成したため、変更できません"}
            {isMissionCompleted && (
              <span className="mt-1 block text-green-600">
                ミッション達成済み
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        {/* 作成者情報 */}
        {shape?.user_display_name && (
          <div className="text-muted-foreground text-sm">
            作成者: {shape.user_display_name}
          </div>
        )}
        {isLoading ? (
          <div className="py-4 text-center text-muted-foreground">
            読み込み中...
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">配布ステータス</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) =>
                  setSelectedStatus(value as PostingShapeStatus)
                }
                disabled={!isOwner}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(postingStatusConfig).map(
                    ([status, config]) => (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-3 w-3 rounded-full ${postingStatusBadgeColors[status as PostingShapeStatus]}`}
                          />
                          <span>{config.label}</span>
                        </div>
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedStatus === "completed" && !isMissionCompleted && (
              <div className="space-y-2">
                <Label htmlFor="postingCount">
                  配布枚数 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="postingCount"
                  type="number"
                  min={1}
                  value={postingCount || ""}
                  onChange={(e) =>
                    setPostingCount(
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  placeholder="配布した枚数を入力"
                  disabled={!isOwner}
                />
                <p className="text-muted-foreground text-sm">
                  配布完了を保存すると、ミッションが自動で達成されます
                </p>
              </div>
            )}

            {selectedStatus === "completed" && isMissionCompleted && (
              <div className="text-muted-foreground text-sm">
                配布枚数: {completedPostingCount}枚（ミッション達成済み）
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="memo">メモ</Label>
              <Textarea
                id="memo"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="地域の特性などを記録"
                rows={3}
                disabled={!isOwner}
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            {isOwner ? "キャンセル" : "閉じる"}
          </Button>
          {isOwner && (
            <Button
              onClick={handleStatusUpdate}
              disabled={isUpdating || isLoading || !canSubmit}
            >
              {isUpdating ? "更新中..." : "更新する"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
