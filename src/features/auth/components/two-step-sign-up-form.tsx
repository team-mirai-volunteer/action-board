"use client";

import { FormMessage, type Message } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CollapsibleInfo } from "@/components/ui/collapsible-info";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { signInWithLine } from "@/features/auth/services/line-auth";
import { calculateAge } from "@/lib/utils/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface TwoStepSignUpFormProps {
  searchParams: Message;
}

// フェーズ1: 同意・生年月日入力
function ConsentPhase({
  isTermsAgreed,
  setIsTermsAgreed,
  selectedYear,
  selectedMonth,
  selectedDay,
  setSelectedYear,
  setSelectedMonth,
  setSelectedDay,
  years,
  months,
  days,
  ageError,
  isAgeValid,
  onNext,
}: {
  isTermsAgreed: boolean;
  setIsTermsAgreed: (value: boolean) => void;
  selectedYear: number;
  selectedMonth: number;
  selectedDay: number;
  setSelectedYear: (value: number) => void;
  setSelectedMonth: (value: number) => void;
  setSelectedDay: (value: number) => void;
  years: number[];
  months: number[];
  days: number[];
  ageError: string | null;
  isAgeValid: boolean;
  onNext: () => void;
}) {
  const canProceed = isTermsAgreed && isAgeValid;

  return (
    <div className="flex flex-col gap-2 mt-2">
      <Label htmlFor="date_of_birth">
        生年月日（満18歳以上である必要があります）
      </Label>

      {/* 生年月日が必要な理由の説明エリア（折りたたみ可能） */}
      <CollapsibleInfo title="なぜ生年月日が必要ですか？" variant="gray">
        <p>
          法律により、サポーター登録は満18歳以上の方に限定されているため、年齢確認が必要です。
        </p>
        <p>
          プライバシーポリシーに従って厳重に管理され、他の目的には使用されません。また、公開されることもありません。
        </p>
      </CollapsibleInfo>
      <fieldset
        className="grid grid-cols-3 gap-2 -mt-2"
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
        <p className="text-primary text-sm font-medium mb-2">{ageError}</p>
      )}

      <div className="flex flex-col gap-3 mb-4 mt-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={isTermsAgreed}
            onCheckedChange={(checked) => setIsTermsAgreed(checked === true)}
          />
          <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
            <Link
              href="/terms"
              className="text-primary underline hover:no-underline"
              target="_blank"
            >
              利用規約
            </Link>
            および
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

      <Button
        type="button"
        disabled={!canProceed}
        onClick={onNext}
        className="w-full"
      >
        次へ進む
      </Button>
      {/* チームみらいサポーター情報 */}
      <Card className="bg-gray-50 border-gray-200 mt-4">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="text-sm text-gray-600">
              {/* <p className="font-medium mb-1">チームみらいサポーターへの参加</p> */}
              <p className="text-gray-600">
                アクションボードに登録することで、サポーターとしてチームみらいを応援することができます。義務や費用は一切発生しません。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// フェーズ2: ログイン方法選択
function LoginSelectionPhase({
  formattedDate,
  onBack,
}: {
  formattedDate: string;
  onBack: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLINELogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // ローカルストレージにサインアップデータを保存（モバイル対応）
      localStorage.setItem(
        "lineLoginData",
        JSON.stringify({
          dateOfBirth: formattedDate,
        }),
      );

      await signInWithLine();
    } catch (error) {
      setIsLoading(false);
      setError("LINE連携に失敗しました。もう一度お試しください。");
      console.error("LINE login error:", error);
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-8">
      {/* エラーメッセージ表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* LINEログインボタン */}
      <Button
        type="button"
        onClick={handleLINELogin}
        disabled={isLoading}
        className="w-full h-12 bg-[#00B900] hover:bg-[#00A000] text-white"
      >
        {isLoading ? "LINE連携中..." : "LINEでアカウント作成"}
      </Button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            または
          </span>
        </div>
      </div>

      {/* Email + Passwordフォームへのリンク */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-12"
        onClick={() => {
          // sessionStorageにデータを保存
          sessionStorage.setItem(
            "signupData",
            JSON.stringify({
              dateOfBirth: formattedDate,
            }),
          );
          router.push("/sign-up-email");
        }}
      >
        メールアドレスとパスワードで作成
      </Button>

      <Button
        type="button"
        variant="link"
        onClick={onBack}
        className="w-full mt-2"
      >
        戻る
      </Button>
    </div>
  );
}

export default function TwoStepSignUpForm({
  searchParams,
}: TwoStepSignUpFormProps) {
  // フェーズ管理
  const [currentPhase, setCurrentPhase] = useState<
    "consent" | "login-selection"
  >("consent");

  // 同意状態
  const [isTermsAgreed, setIsTermsAgreed] = useState(false);

  // 生年月日の状態
  const [selectedYear, setSelectedYear] = useState(1990);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);
  const [ageError, setAgeError] = useState<string | null>(null);
  const [isAgeValid, setIsAgeValid] = useState(false);

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

  const handleNext = () => {
    setCurrentPhase("login-selection");
  };

  const handleBack = () => {
    setCurrentPhase("consent");
  };

  return (
    <div className="flex flex-col min-w-72 max-w-72 mx-auto">
      <h1 className="text-2xl font-medium text-center mb-2">
        アクションボードに登録
      </h1>
      <p className="text-sm text-foreground text-center mb-4">
        すでに登録済みの方は{" "}
        <Link className="text-primary font-medium underline" href="/sign-in">
          こちら
        </Link>
      </p>

      {/* searchParamsからのメッセージを表示 */}
      <FormMessage className="mt-8" message={searchParams} />

      {currentPhase === "consent" ? (
        <ConsentPhase
          isTermsAgreed={isTermsAgreed}
          setIsTermsAgreed={setIsTermsAgreed}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          selectedDay={selectedDay}
          setSelectedYear={setSelectedYear}
          setSelectedMonth={setSelectedMonth}
          setSelectedDay={setSelectedDay}
          years={years}
          months={months}
          days={days}
          ageError={ageError}
          isAgeValid={isAgeValid}
          onNext={handleNext}
        />
      ) : (
        <LoginSelectionPhase
          formattedDate={formattedDate}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
