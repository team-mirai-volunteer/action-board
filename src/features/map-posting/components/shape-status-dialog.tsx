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
import { maskUsername } from "@/lib/utils/privacy";
import { History } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type PostingShapeStatus,
  statusConfig,
  statusOrder,
} from "../config/status-config";
import type { StatusHistory } from "../services/posting-shapes";
import type { MapShape } from "../types/posting-types";

interface ShapeStatusDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  shape: MapShape | null;
  onStatusUpdate: (
    shapeId: string,
    status: PostingShapeStatus,
    postingCount: number,
    note: string,
  ) => Promise<void>;
  onLoadHistory: (shapeId: string) => Promise<StatusHistory[]>;
  isUpdating: boolean;
}

export function ShapeStatusDialog({
  isOpen,
  onOpenChange,
  shape,
  onStatusUpdate,
  onLoadHistory,
  isUpdating,
}: ShapeStatusDialogProps) {
  const [updateStatus, setUpdateStatus] = useState<PostingShapeStatus>(
    (shape?.status as PostingShapeStatus) || "planned",
  );
  const [postingCount, setPostingCount] = useState(10);
  const [updateNote, setUpdateNote] = useState("");
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // シェイプが変わったらステータスをリセット
  const handleOpenChange = (open: boolean) => {
    if (open && shape) {
      setUpdateStatus((shape.status as PostingShapeStatus) || "planned");
      setPostingCount(10);
      setUpdateNote("");
      setHistory([]);
      setShowHistory(false);
    }
    onOpenChange(open);
  };

  const handleLoadHistory = async () => {
    if (!shape?.id) return;

    setLoadingHistory(true);
    try {
      const data = await onLoadHistory(shape.id);
      setHistory(data);
    } catch (error) {
      toast.error("履歴の読み込みに失敗しました");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async () => {
    if (!shape?.id) return;

    try {
      await onStatusUpdate(shape.id, updateStatus, postingCount, updateNote);
      onOpenChange(false);
    } catch (error) {
      // エラーは呼び出し元で処理
    }
  };

  // シェイプ名または座標から表示テキストを生成
  const getShapeName = (shape: MapShape | null): string => {
    if (!shape) return "";
    const props = shape.properties as Record<string, unknown> | undefined;
    if (props?.text) return String(props.text);
    if (props?.name) return String(props.name);
    return `エリア ${shape.id?.substring(0, 8) || ""}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>配布状況を報告</DialogTitle>
          <DialogDescription>{getShapeName(shape)}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* ステータス選択 */}
          <div className="space-y-2">
            <Label htmlFor="status">配布ステータス</Label>
            <Select
              value={updateStatus}
              onValueChange={(value: string) =>
                setUpdateStatus(value as PostingShapeStatus)
              }
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOrder.map((status) => {
                  const config = statusConfig[status];
                  return (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full shrink-0 ${config.color}`}
                        />
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* 配布枚数入力（完了の場合のみ表示） */}
          {updateStatus === "completed" && (
            <div className="space-y-2">
              <Label htmlFor="postingCount">配布枚数</Label>
              <Input
                id="postingCount"
                type="number"
                min={1}
                max={1000}
                value={postingCount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPostingCount(
                    Math.max(1, Number.parseInt(e.target.value) || 1),
                  )
                }
                placeholder="配布した枚数を入力"
              />
              <p className="text-xs text-muted-foreground">
                配布1枚につき50XPを獲得できます
              </p>
            </div>
          )}

          {/* 備考入力 */}
          <div className="space-y-2">
            <Label htmlFor="note">備考（任意）</Label>
            <Textarea
              id="note"
              value={updateNote}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setUpdateNote(e.target.value)
              }
              placeholder="配布状況や気づいたことなど"
              rows={3}
            />
          </div>
        </div>

        {/* 履歴セクション */}
        {showHistory && (
          <div className="border-t pt-4 mt-4 max-h-48 overflow-y-auto">
            <h3 className="font-semibold mb-2">更新履歴</h3>
            {loadingHistory ? (
              <div className="text-sm text-muted-foreground">読み込み中...</div>
            ) : history.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                履歴がありません
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((item: StatusHistory) => (
                  <div key={item.id} className="text-sm">
                    <div className="text-muted-foreground">
                      {item.previous_status
                        ? statusConfig[
                            item.previous_status as PostingShapeStatus
                          ]?.label || item.previous_status
                        : "新規"}
                      →
                      {statusConfig[item.new_status as PostingShapeStatus]
                        ?.label || item.new_status}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {new Date(item.created_at).toLocaleString("ja-JP")}
                      {item.user?.name && (
                        <span className="ml-2">
                          by {maskUsername(item.user.name)}
                        </span>
                      )}
                      {item.note && (
                        <span className="ml-2">「{item.note}」</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (!showHistory) {
                handleLoadHistory();
              }
              setShowHistory(!showHistory);
            }}
            type="button"
          >
            <History className="mr-2 h-4 w-4" />
            これまでの報告
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
            >
              キャンセル
            </Button>
            <Button onClick={handleSubmit} disabled={isUpdating}>
              {isUpdating ? "報告中..." : "報告する"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
