"use client";

import { CollapsibleInfo } from "@/components/common/collapsible-info";
import { FormMessage, type Message } from "@/components/common/form-message";
import { SubmitButton } from "@/components/common/submit-button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PartyMembership } from "@/features/party-membership/types";
import { updateProfile } from "@/features/user-settings/actions/profile-actions";
import { PrefectureSelect } from "@/features/user-settings/components/prefecture-select";
import { AVATAR_MAX_FILE_SIZE, getAvatarUrl } from "@/lib/services/avatar";
import { calculateAge } from "@/lib/utils/utils";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

// AvatarUploadコンポーネントを削除し、メインのフォームに統合

interface ProfileFormProps {
  message?: Message;
  isNew: boolean;
  initialProfile: {
    name?: string;
    address_prefecture?: string;
    date_of_birth?: string;
    x_username?: string | null;
    github_username?: string | null;
    avatar_url?: string | null;
  } | null;
  initialPrivateUser: {
    id?: string;
    postcode?: string;
  } | null;
  partyMembership: PartyMembership | null;
  email: string | null;
}

export default function ProfileForm({
  message,
  isNew,
  initialProfile,
  initialPrivateUser,
  partyMembership,
  email,
}: ProfileFormProps) {
  const [queryMessage, setQueryMessage] = useState<Message | undefined>(
    message,
  );
  const [state, formAction, isPending] = useActionState(updateProfile, null);
  const [avatarPath, setAvatarPath] = useState<string | null>(
    initialProfile?.avatar_url || null,
  );
  // 画像プレビュー用のステート
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initialProfile?.avatar_url ? getAvatarUrl(initialProfile.avatar_url) : null,
  );
  const [selectedPrefecture, setSelectedPrefecture] = useState<string>(
    initialProfile?.address_prefecture || "",
  );

  // 生年月日の状態を追加
  const initialDate = initialProfile?.date_of_birth
    ? new Date(initialProfile.date_of_birth)
    : null;
  const [selectedYear, setSelectedYear] = useState(
    initialDate?.getFullYear() || 1990,
  );
  const [selectedMonth, setSelectedMonth] = useState(
    (initialDate?.getMonth() || 0) + 1,
  );
  const [selectedDay, setSelectedDay] = useState(initialDate?.getDate() || 1);
  const [ageError, setAgeError] = useState<string | null>(null);
  const [isAgeValid, setIsAgeValid] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 年月日の選択肢を生成
  const birthYearThreshold = new Date().getFullYear() - 18;
  const years = Array.from({ length: 100 }, (_, i) => birthYearThreshold - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from(
    { length: new Date(selectedYear, selectedMonth, 0).getDate() },
    (_, i) => i + 1,
  );

  // 日付フォーマット関数
  const formatDate = useCallback(
    (year: number | null, month: number | null, day: number | null): string => {
      if (!year || !month || !day) return "";
      const pad = (n: number) => n.toString().padStart(2, "0");
      return `${year}-${pad(month)}-${pad(day)}`;
    },
    [],
  );

  const formattedDate = formatDate(selectedYear, selectedMonth, selectedDay);

  // 年齢チェック関数
  const verifyAge = useCallback((birthdate: string): boolean => {
    if (!birthdate) return false;

    const age = calculateAge(birthdate);
    if (age < 18) {
      const yearsToWait = 18 - age;
      const waitText = yearsToWait > 1 ? `あと${yearsToWait}年で` : "もうすぐ";
      setAgeError(
        `18歳以上の方のみご登録いただけます。${waitText}登録できますので、その日を楽しみにお待ちください！`,
      );
      setIsAgeValid(false);
      return false;
    }

    setAgeError(null);
    setIsAgeValid(true);
    return true;
  }, []);

  useEffect(() => {
    // フォーム送信成功時の処理
    if (state?.success && isNew) {
      router.push("/");
    }
    if (state?.success) {
      setQueryMessage(undefined);
    }
  }, [state?.success, isNew, router]);

  // 生年月日が変更された際に年齢チェックを実行
  useEffect(() => {
    verifyAge(formattedDate);
  }, [formattedDate, verifyAge]);

  // 月を変更した際、日付が月の日数を超えていたら1日に変更する
  useEffect(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    if (selectedDay > daysInMonth) {
      setSelectedDay(1);
    }
  }, [selectedYear, selectedMonth, selectedDay]);

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

          {!isNew && (
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              {!email || email?.endsWith("@line.local") ? (
                <p className="text-sm text-gray-500">
                  メールアドレスが登録されていないため、表示できません
                </p>
              ) : (
                <>
                  <p className="text-sm text-gray-500">
                    この項目は公開されず、変更できません
                  </p>
                  <Input
                    // フォーム送信時に値が送信されないようにname属性は含めない
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="bg-gray-50 cursor-not-allowed"
                  />
                </>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="date_of_birth">生年月日</Label>
            <p className="text-sm text-gray-500">この項目は公開されません</p>
            {/* 生年月日が必要な理由の説明エリア（折りたたみ可能） */}
            <CollapsibleInfo title="なぜ生年月日が必要ですか？" variant="gray">
              <p>
                法律により、サポーター登録は満18歳以上の方に限定されているため、年齢確認が必要です。
              </p>
              <p>
                プライバシーポリシーに従って厳重に管理され、他の目的には使用されません。
              </p>
            </CollapsibleInfo>
            <fieldset
              className="grid grid-cols-3 gap-2"
              aria-labelledby="date_of_birth"
            >
              <legend className="sr-only">生年月日の選択</legend>
              <div>
                <Label htmlFor="date_of_birth_year" className="sr-only">
                  年
                </Label>
                <Select
                  name="year_select"
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(Number(value))}
                  required
                  disabled={isPending}
                >
                  <SelectTrigger data-testid="year_select">
                    <SelectValue placeholder="年" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}年
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date_of_birth_month" className="sr-only">
                  月
                </Label>
                <Select
                  name="month_select"
                  value={selectedMonth.toString()}
                  onValueChange={(value) => setSelectedMonth(Number(value))}
                  required
                  disabled={isPending}
                >
                  <SelectTrigger data-testid="month_select">
                    <SelectValue placeholder="月" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month} value={month.toString()}>
                        {month}月
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date_of_birth_day" className="sr-only">
                  日
                </Label>
                <Select
                  name="day_select"
                  value={selectedDay.toString()}
                  onValueChange={(value) => setSelectedDay(Number(value))}
                  required
                  disabled={isPending}
                >
                  <SelectTrigger data-testid="day_select">
                    <SelectValue placeholder="日" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}日
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </fieldset>
            {ageError && (
              <p className="text-primary text-sm font-medium mb-2">
                {ageError}
              </p>
            )}
            {/* 隠しフィールドでフォーマット済みの日付を送信 */}
            <input type="hidden" name="date_of_birth" value={formattedDate} />
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
            {/* 郵便番号が必要な理由の説明エリア（折りたたみ可能） */}
            <CollapsibleInfo title="なぜ郵便番号が必要ですか？" variant="gray">
              <p>
                郵便番号は、ポスティングなど地域別のミッションを適切に届けるために必要です。
              </p>
              <p>
                プライバシーポリシーに従って厳重に管理され、他の目的には使用されません。
              </p>
            </CollapsibleInfo>
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
          {!isNew && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="github_username">GitHubのユーザー名</Label>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  オプション
                </span>
              </div>
              <p className="text-sm text-gray-500">
                GitHubのユーザー名を設定すると、あなたのプロフィールに表示することができます。
              </p>
              <Input
                id="github_username"
                name="github_username"
                type="text"
                defaultValue={initialProfile?.github_username || ""}
                placeholder="GitHubのユーザー名"
                disabled={isPending}
                maxLength={39}
              />
            </div>
          )}
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
          <SubmitButton className="w-full" disabled={isPending || !isAgeValid}>
            {isNew ? "登録する" : "更新する"}
          </SubmitButton>
        </CardFooter>
      </form>
    </Card>
  );
}
