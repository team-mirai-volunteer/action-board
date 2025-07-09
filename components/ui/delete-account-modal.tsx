"use client";

import { deleteAccountAction } from "@/app/(protected)/settings/profile/delete-account-action";
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
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteAccountModal({
  isOpen,
  onClose,
}: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== "退会する" || isDeleting) return;

    setIsDeleting(true);
    try {
      await deleteAccountAction();
      // リダイレクトが成功した場合、この行は実行されない
    } catch (error) {
      // NEXT_REDIRECT エラーは正常な動作なので、それ以外のエラーのみアラート表示
      if (error instanceof Error && !error.message.includes("NEXT_REDIRECT")) {
        console.error("退会処理でエラーが発生しました:", error);
        alert("退会処理でエラーが発生しました。もう一度お試しください。");
        setIsDeleting(false);
        onClose();
      }
      // NEXT_REDIRECT の場合は何もしない（リダイレクトが実行される）
    }
  };

  const handleClose = () => {
    setConfirmText("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            アカウントの削除
          </DialogTitle>
          <DialogDescription className="text-left space-y-2">
            <p className="font-medium text-red-600">
              この操作は元に戻すことができません。
            </p>
            <p>アカウントを削除すると、以下のデータが完全に削除されます：</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>プロフィール情報</li>
              <li>ミッション達成記録</li>
              <li>経験値とレベル情報</li>
              <li>バッジ情報</li>
              <li>その他のアカウントに関連するすべてのデータ</li>
            </ul>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="confirm-text">
              続行するには「退会する」と入力してください
            </Label>
            <Input
              id="confirm-text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="退会する"
              disabled={isDeleting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
            キャンセル
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={confirmText !== "退会する" || isDeleting}
          >
            {isDeleting ? "削除中..." : "アカウントを削除"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
