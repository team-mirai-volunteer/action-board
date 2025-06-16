"use client";

import { FormMessage, type Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAvatarUrl } from "@/lib/avatar";
import { AVATAR_MAX_FILE_SIZE } from "@/lib/avatar";
import { createClient } from "@/lib/supabase/client";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { PrefectureSelect } from "./PrefectureSelect";
import { updateProfile } from "./actions";

// AvatarUploadコンポーネントを削除し、メインのフォームに統合

interface ProfileFormProps {
  message?: Message;
  isNew: boolean;
  initialProfile: {
    name?: string;
    address_prefecture?: string;
    date_of_birth?: string;
    x_username?: string | null;
    avatar_url?: string | null;
  } | null;
  initialPrivateUser: {
    id?: string;
    postcode?: string;
  } | null;
}

export default function ProfileForm({
  message,
  isNew,
  initialProfile,
  initialPrivateUser,
}: ProfileFormProps) {
  const supabase = createClient();
  const [queryMessage, setQueryMessage] = useState<Message | undefined>(
    message,
  );
  const [state, formAction, isPending] = useActionState(updateProfile, null);
  const [avatarPath, setAvatarPath] = useState<string | null>(
    initialProfile?.avatar_url || null,
  );
  // 画像プレビュー用のステート
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initialProfile?.avatar_url
      ? getAvatarUrl(supabase, initialProfile.avatar_url)
      : null,
  );
  const [selectedPrefecture, setSelectedPrefecture] = useState<string>(
    initialProfile?.address_prefecture || "",
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    // フォーム送信成功時の処理
    if (state?.success && isNew) {
      router.push("/");
    }
    if (state?.success) {
      setQueryMessage(undefined);
    }
  }, [state?.success, isNew, router]);

  // ファイル選択時のプレビュー処理
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック (5MB)
    if (file.size > AVATAR_MAX_FILE_SIZE) {
      alert("画像サイズは5MB以下にしてください");
      e.target.value = "";
      return;
    }

    // 画像プレビュー生成
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>プロフィール設定</CardTitle>
        <CardDescription>
          {isNew
            ? "公開されるプロフィール情報を登録します。"
            : "公開されるプロフィール情報を編集します。"}
        </CardDescription>
      </CardHeader>
      {queryMessage && (
        <div className="p-2 mb-4">
          <FormMessage message={queryMessage} />
        </div>
      )}
      <form action={formAction}>
        <CardContent className="space-y-4">
          {/* アバターアップロード - ニックネームの上に配置 */}
          <div className="flex flex-col items-center space-y-4 mb-4">
            <div className="relative">
              <Avatar
                className="h-32 w-32 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <AvatarImage
                  src={avatarPreview || undefined}
                  alt="プロフィール画像"
                  style={{ objectFit: "cover" }}
                />
                <AvatarFallback className="text-6xl bg-emerald-100 text-emerald-700 font-medium">
                  {initialProfile?.name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>

              {/* 削除アイコン - 現在の画像がある場合のみ表示 */}
              {avatarPreview && (
                <button
                  type="button"
                  className="absolute top-0 right-0 bg-red-400 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                  onClick={() => {
                    // 画像URLをクリアし、プレビューも削除
                    setAvatarPath(null);
                    setAvatarPreview(null);
                  }}
                  disabled={isPending}
                  aria-label="画像を削除"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* 現在のアバターURLをサーバーに送信するための隠しフィールド */}
            <input type="hidden" name="avatar_path" value={avatarPath || ""} />

            {/* 画像選択入力フィールド - これでServer Actionにファイルを送る */}
            <div className="flex flex-col items-center gap-2">
              <input
                type="file"
                name="avatar"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending}
              >
                画像を変更する
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">ニックネーム</Label>
            <Input
              id="name"
              name="name"
              type="text"
              defaultValue={initialProfile?.name || ""}
              placeholder="あなたのニックネーム"
              maxLength={100}
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_of_birth">生年月日</Label>
            <Input
              type="date"
              name="date_of_birth"
              required
              readOnly
              value={initialProfile?.date_of_birth || ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address_prefecture">都道府県</Label>
            <PrefectureSelect
              name="address_prefecture"
              id="address_prefecture"
              defaultValue={initialProfile?.address_prefecture || ""}
              required
              disabled={isPending}
              onValueChange={setSelectedPrefecture}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postcode">郵便番号(ハイフンなし半角7桁)</Label>
            <p className="text-sm text-gray-500">この項目は公開されません</p>
            {selectedPrefecture === "海外" && (
              <p className="text-sm text-red-600">
                海外在住の方は0000000を入力ください
              </p>
            )}
            <Input
              id="postcode"
              name="postcode"
              type="text"
              defaultValue={initialPrivateUser?.postcode || ""}
              placeholder="郵便番号(ハイフンなし半角7桁)"
              pattern="[0-9]{7}"
              maxLength={7}
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="x_username">X(旧Twitter)のユーザー名</Label>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                オプション
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Xのユーザー名を設定すると、あなたのプロフィールに表示することができます。
            </p>
            <Input
              id="x_username"
              name="x_username"
              type="text"
              defaultValue={initialProfile?.x_username || ""}
              placeholder="@を除いたユーザー名"
              disabled={isPending}
              maxLength={50}
            />
          </div>
          {state?.success && (
            <p className="text-center text-sm text-green-600">
              {isNew
                ? "プロフィールを新規登録しました。"
                : "プロフィールを更新しました。"}
            </p>
          )}
          {state?.error && (
            <p className="text-center text-sm text-red-600">{state.error}</p>
          )}
        </CardContent>
        <CardFooter>
          <SubmitButton className="w-full" disabled={isPending}>
            {isNew ? "登録する" : "更新する"}
          </SubmitButton>
        </CardFooter>
      </form>
    </Card>
  );
}
