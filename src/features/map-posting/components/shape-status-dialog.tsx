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
  isAdmin: boolean;
  onStatusUpdated: (
    id: string,
    newStatus: PostingShapeStatus,
    newMemo: string | null,
    postingCount?: number | null,
  ) => void;
  onDelete?: (id: string) => Promise<void>;
}

export function ShapeStatusDialog({
  isOpen,
  onOpenChange,
  shape,
  currentUserId,
  isAdmin,
  onStatusUpdated,
  onDelete,
}: ShapeStatusDialogProps) {
  // Check if the current user owns this shape
  const isOwner = shape?.user_id === currentUserId || !shape?.user_id;
  // Allow edit if user is owner or admin
  const canEdit = isOwner || isAdmin;
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
  const [isDeleting, setIsDeleting] = useState(false);

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

      // Determine the posting count to pass
      const finalPostingCount =
        selectedStatus === "completed"
          ? postingCount || completedPostingCount
          : null;
      onStatusUpdated(
        shape.id,
        selectedStatus,
        memo || null,
        finalPostingCount,
      );
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("更新に失敗しました");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!shape?.id || !onDelete) return;

    const confirmed = window.confirm(
      "この図形を削除しますか？\n削除すると元に戻せません。",
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await onDelete(shape.id);
      toast.success("図形を削除しました");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete shape:", error);
      toast.error("削除に失敗しました");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>配布ステータス{canEdit ? "の変更" : ""}</DialogTitle>
          <DialogDescription>
            {canEdit
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
                disabled={!canEdit}
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
                  disabled={!canEdit}
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
                disabled={!canEdit}
              />
            </div>
          </div>
        )}
        <DialogFooter className="flex-row justify-between sm:justify-between">
          {canEdit && onDelete ? (
            <Button
              variant="link"
              onClick={handleDelete}
              disabled={isUpdating || isDeleting || isLoading}
              className="text-gray-600 hover:text-red-600"
            >
              {isDeleting ? "削除中..." : "削除"}
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating || isDeleting}
            >
              {canEdit ? "キャンセル" : "閉じる"}
            </Button>
            {canEdit && (
              <Button
                onClick={handleStatusUpdate}
                disabled={isUpdating || isDeleting || isLoading || !canSubmit}
              >
                {isUpdating ? "更新中..." : "更新する"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
