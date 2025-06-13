"use client";

import { signUpActionWithState } from "@/app/actions";
import { FormMessage, type Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calculateAge } from "@/lib/utils/utils";
import Link from "next/link";
import { useActionState, useCallback, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

interface SignUpFormProps {
  searchParams: Message;
  referralCode: string | null;
}

// フォームコンポーネントを分離してuseFormStatusを使用
function SignUpFormContent({
  isTermsAgreed,
  isPrivacyAgreed,
  email,
  password,
  ageError,
  isFormValid,
  setIsTermsAgreed,
  setIsPrivacyAgreed,
  setEmail,
  setPassword,
  selectedYear,
  selectedMonth,
  selectedDay,
  setSelectedYear,
  setSelectedMonth,
  setSelectedDay,
  years,
  months,
  days,
  formattedDate,
}: {
  isTermsAgreed: boolean;
  isPrivacyAgreed: boolean;
  email: string;
  password: string;
  ageError: string | null;
  isFormValid: boolean;
  setIsTermsAgreed: (value: boolean) => void;
  setIsPrivacyAgreed: (value: boolean) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  selectedYear: number;
  selectedMonth: number;
  selectedDay: number;
  setSelectedYear: (value: number) => void;
  setSelectedMonth: (value: number) => void;
  setSelectedDay: (value: number) => void;
  years: number[];
  months: number[];
  days: number[];
  formattedDate: string;
}) {
  const { pending } = useFormStatus();

  return (
    <>
      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
        <Label htmlFor="email">メールアドレス</Label>
        <Input
          name="email"
          placeholder="you@example.com"
          required
          disabled={pending}
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Label htmlFor="password">パスワード</Label>
        <p className="text-xs text-muted-foreground mb-2">
          ※8文字以上で半角英数を含めてください。英数と一部記号が使えます。
        </p>
        <Input
          type="password"
          name="password"
          placeholder="パスワード"
          minLength={8}
          required
          disabled={pending}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Label htmlFor="date_of_birth">
          生年月日（満18歳以上である必要があります）
        </Label>
        <fieldset
          className="grid grid-cols-3 gap-2"
          aria-labelledby="date_of_birth_year"
        >
          <legend className="sr-only">生年月日</legend>
          <div>
            <Label htmlFor="date_of_birth_year" className="sr-only">
              年
            </Label>
            <Select
              name="year_select"
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(Number(value))}
              required
              disabled={pending}
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
              disabled={pending}
              required
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
              disabled={pending}
              required
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
        <input type="hidden" name="date_of_birth" value={formattedDate} />
        {ageError && (
          <p className="text-primary text-sm font-medium mb-2">{ageError}</p>
        )}

        <div className="flex flex-col gap-3 mb-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={isTermsAgreed}
              onCheckedChange={(checked) => setIsTermsAgreed(checked === true)}
              disabled={pending}
            />
            <input
              type="hidden"
              name="terms_agreed"
              value={isTermsAgreed ? "true" : "false"}
            />
            <Label
              htmlFor="terms"
              className="text-sm font-normal cursor-pointer"
            >
              <Link
                href="/terms"
                className="text-primary underline hover:no-underline"
                target="_blank"
              >
                利用規約
              </Link>
              に同意する
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="privacy"
              checked={isPrivacyAgreed}
              onCheckedChange={(checked) =>
                setIsPrivacyAgreed(checked === true)
              }
              disabled={pending}
            />
            <input
              type="hidden"
              name="privacy_agreed"
              value={isPrivacyAgreed ? "true" : "false"}
            />
            <Label
              htmlFor="privacy"
              className="text-sm font-normal cursor-pointer"
            >
              <Link
                href="/privacy"
                className="text-primary underline hover:no-underline"
                target="_blank"
              >
                プライバシーポリシー
              </Link>
              に同意する
            </Label>
          </div>
        </div>

        <SubmitButton
          pendingText="サインアップ中..."
          disabled={
            !isTermsAgreed ||
            !isPrivacyAgreed ||
            !email ||
            !password ||
            !formattedDate ||
            !isFormValid ||
            pending
          }
        >
          サインアップ
        </SubmitButton>
      </div>
    </>
  );
}

export default function SignUpForm({
  searchParams,
  referralCode,
}: SignUpFormProps) {
  // useActionStateを使用してフォームの状態とメッセージを管理
  const [state, formAction] = useActionState(signUpActionWithState, null);

  // フォームの状態管理
  const [isTermsAgreed, setIsTermsAgreed] = useState(false);
  const [isPrivacyAgreed, setIsPrivacyAgreed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ageError, setAgeError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(1990);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);
  const [isFormValid, setIsFormValid] = useState(true);

  const birthYearThreshold = 2007;
  const years = Array.from({ length: 100 }, (_, i) => birthYearThreshold - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from(
    { length: new Date(selectedYear, selectedMonth, 0).getDate() },
    (_, i) => i + 1,
  );

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
      setIsFormValid(false);
      return false;
    }

    setAgeError(null);
    setIsFormValid(true);
    return true;
  }, []);

  // 生年月日が変更された際に年齢チェックを実行
  useEffect(() => {
    verifyAge(formattedDate);
  }, [formattedDate, verifyAge]);

  // サーバーから返されたフォームデータで状態を復元
  useEffect(() => {
    if (state?.formData) {
      setIsTermsAgreed(state.formData.terms_agreed);
      setIsPrivacyAgreed(state.formData.privacy_agreed);
      setEmail(state.formData.email);
      setPassword(state.formData.password);

      if (state.formData.date_of_birth) {
        const [year, month, day] = state.formData.date_of_birth
          .split("-")
          .map(Number);
        if (!Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day)) {
          setSelectedYear(year);
          setSelectedMonth(month);
          setSelectedDay(day);
        }
      }
    }
  }, [state]);

  // 月を変更した際、日付が月の日数を超えていたら1日に変更する
  // ex. 12月31日 → 12月を11月に変更 → 11月1日
  useEffect(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    if (selectedDay > daysInMonth) {
      setSelectedDay(1);
    }
  }, [selectedYear, selectedMonth, selectedDay]);

  return (
    <form
      action={formAction}
      className="flex flex-col min-w-72 max-w-72 mx-auto"
    >
      <input type="hidden" name="ref" value={referralCode ?? ""} />
      <h1 className="text-2xl font-medium text-center mb-2">
        アカウントを作成する
      </h1>
      <p className="text-sm text-foreground text-center">
        すでに登録済みの方は{" "}
        <Link className="text-primary font-medium underline" href="/sign-in">
          こちら
        </Link>
      </p>

      {/* サーバーアクションからのメッセージを表示 */}
      {state && <FormMessage className="mt-8" message={state} />}

      {/* 元のsearchParamsからのメッセージも表示（後方互換性のため） */}
      <FormMessage className="mt-8" message={searchParams} />

      <SignUpFormContent
        isTermsAgreed={isTermsAgreed}
        isPrivacyAgreed={isPrivacyAgreed}
        email={email}
        password={password}
        ageError={ageError}
        isFormValid={isFormValid}
        setIsTermsAgreed={setIsTermsAgreed}
        setIsPrivacyAgreed={setIsPrivacyAgreed}
        setEmail={setEmail}
        setPassword={setPassword}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        selectedDay={selectedDay}
        setSelectedYear={setSelectedYear}
        setSelectedMonth={setSelectedMonth}
        setSelectedDay={setSelectedDay}
        years={years}
        months={months}
        days={days}
        formattedDate={formattedDate}
      />
    </form>
  );
}
